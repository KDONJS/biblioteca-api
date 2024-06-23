# Etapa de construcción
FROM node:18-alpine as build

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos de package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias de producción
RUN npm install --only=production

# Copiar el resto de la aplicación
COPY . .

# Etapa final
FROM node:18-alpine

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=build /app .

# Exponer el puerto que utiliza la aplicación
EXPOSE 5000

# Ejecutar la aplicación
CMD ["node", "app.js"]