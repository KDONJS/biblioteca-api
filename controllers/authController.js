const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { bucket } = require('../config/firebase');
const fs = require('fs');
const path = require('path');

// Registrar usuario
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password
    });

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Crear y devolver token JWT
    const payload = {
      user: {
        id: user.id
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Crear y devolver token JWT
    const payload = {
      user: {
        id: user.id
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

// Actualizar perfil de usuario
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
        await bucket.file(`profile-pictures/${oldFileName}`).delete();
      }

      // Asignar la nueva foto de perfil
      updateFields.profilePicture = profilePicture;

      // Eliminar el archivo local
      fs.unlinkSync(filePath);
    }

    user = await User.findByIdAndUpdate(req.user.id, { $set: updateFields }, { new: true }).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.logout = async (req, res) => {
  try {
    // Aquí podrías manejar la invalidación del token si es necesario
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};