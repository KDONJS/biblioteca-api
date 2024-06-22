# Usa una imagen base oficial de Node.js 18
FROM node:18

# Establece el directorio de trabajo
WORKDIR /usr/src/app

# Copia los archivos de package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto en el que tu aplicación se ejecutará
EXPOSE 5000

# Define el comando por defecto para ejecutar tu aplicación
CMD ["node", "app.js"]