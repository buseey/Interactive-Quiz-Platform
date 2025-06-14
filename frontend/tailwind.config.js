        /** @type {import('tailwindcss').Config} */
        module.exports = {
          content: [
            "./src/**/*.{js,jsx,ts,tsx}", // src klasöründeki tüm js, jsx, ts, tsx dosyalarını tara
            "./public/index.html",         // public klasöründeki index.html dosyasını tara
          ],
          theme: {
            extend: {
              fontFamily: {
                sans: ['Inter', 'sans-serif'],
              },
            },
          },
          plugins: [],
        }
        