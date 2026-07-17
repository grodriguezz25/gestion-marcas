@echo off
echo Iniciando servidor de Next.js para el proyecto de marcas...
echo El navegador se abrira automaticamente en unos segundos en http://localhost:3000...

:: Abre el navegador despues de 5 segundos (en segundo plano) para darle tiempo al servidor de arrancar
start cmd /c "timeout /t 5 >nul && start http://localhost:3000"

:: Inicia el servidor de Next.js
npm run dev
pause
