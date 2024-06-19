const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RevokedToken = require('../models/RevokedToken'); // Importar el modelo de tokens revocados
const { bucket } = require('../config/firebase');
const fs = require('fs');
const path = require('path');

// Registrar usuario
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role // Asignar el rol del usuario
    });

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Crear y devolver token JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role // Añadir el rol al payload
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Iniciar sesión de usuario
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ msg: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Crear y devolver token JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role // Añadir el rol al payload
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Cerrar sesión de usuario
exports.logout = async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (token) {
      const revokedToken = new RevokedToken({ token });
      await revokedToken.save();
    }
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Obtener perfil de usuario
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Actualizar perfil de usuario (propio)
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const updateFields = { name, email };

  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (req.file) {
      const filePath = req.file.path;
      const fileName = req.file.filename;

      // Subir el nuevo archivo
      await bucket.upload(filePath, {
        destination: `profile-pictures/${fileName}`,
        gzip: true,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });

      const profilePicture = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/profile-pictures/${fileName}`;

      // Eliminar la foto de perfil anterior si existe
      if (user.profilePicture) {
        const oldFileName = path.basename(user.profilePicture);
        const oldFilePath = path.resolve(__dirname, '../uploads', oldFileName);
        if (isValidPath(oldFilePath)) {
          await bucket.file(`profile-pictures/${oldFileName}`).delete();
          fs.unlinkSync(oldFilePath);
        } else {
          console.error('Invalid file path detected:', oldFilePath);
        }
      }

      // Asignar la nueva foto de perfil
      updateFields.profilePicture = profilePicture;

      // Eliminar el archivo local
      if (isValidPath(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.error('Invalid file path detected:', filePath);
      }
    }

    user = await User.findByIdAndUpdate(req.user.id, { $set: updateFields }, { new: true }).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Actualizar perfil de otro usuario (solo admin)
exports.updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, email, role, isActive } = req.body;
  const updateFields = { name, email, role, isActive };

  try {
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (req.file) {
      const filePath = req.file.path;
      const fileName = req.file.filename;

      // Subir el nuevo archivo
      await bucket.upload(filePath, {
        destination: `profile-pictures/${fileName}`,
        gzip: true,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });

      const profilePicture = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/profile-pictures/${fileName}`;

      // Eliminar la foto de perfil anterior si existe
      if (user.profilePicture) {
        const oldFileName = path.basename(user.profilePicture);
        await bucket.file(`profile-pictures/${oldFileName}`).delete();
      }

      // Asignar la nueva foto de perfil
      updateFields.profilePicture = profilePicture;

      // Eliminar el archivo local
      fs.unlinkSync(filePath);
    }

    user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true }).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Eliminar usuario (solo admin)
exports.deleteAccount = async (req, res) => {
  const { userId } = req.params;

  try {
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Eliminar archivos de perfil del bucket de Firebase Storage si existen
    if (user.profilePicture) {
      const fileName = path.basename(user.profilePicture);
      const filePath = path.resolve(__dirname, '../uploads', fileName);
      if (isValidPath(filePath)) {
        await bucket.file(`profile-pictures/${fileName}`).delete();
        fs.unlinkSync(filePath);
      } else {
        console.error('Invalid file path detected:', filePath);
      }
    }

    await User.findByIdAndDelete(userId);

    res.json({ msg: 'User account and files removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Desactivar usuario (propio)
exports.deactivateAccount = async (req, res) => {
  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ msg: 'User account deactivated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Activar usuario (propio)
exports.activateAccount = async (req, res) => {
  try {
    let user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.json({ msg: 'User account activated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};