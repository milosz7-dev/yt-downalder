const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();

// Serwujemy pliki statyczne (index.html) z folderu 'public'
app.use(express.static('public'));

app.get('/download', (req, res) => {
    const videoURL = req.query.url;
    if (!videoURL) return res.status(400).send('Brak linku!');

    console.log(`Rozpoczynam pobieranie dla: ${videoURL}`);

    // Ustawiamy nagłówek, żeby przeglądarka zaczęła pobierać plik
    res.header('Content-Disposition', 'attachment; filename="video.mp4"');

    // Uruchamiamy yt-dlp.exe
    // -f "best[ext=mp4]" wybiera najlepszy gotowy plik MP4 (obraz+dźwięk)
    const downloader = spawn('./yt-dlp.exe', [
        '-o', '-',            // Streamuj do standardowego wyjścia (stdout)
        '-f', 'best[ext=mp4]', // Wybierz format MP4 z audio
        '--no-playlist',      // Pobieraj tylko jeden film, nie całą listę
        videoURL
    ]);

    // Przekierowanie strumienia danych prosto do użytkownika
    downloader.stdout.pipe(res);

    downloader.stderr.on('data', (data) => {
        console.error(`Log yt-dlp: ${data}`);
    });

    downloader.on('close', (code) => {
        if (code === 0) {
            console.log('Pobieranie zakończone sukcesem!');
        } else {
            console.error(`yt-dlp zakończył z błędem: ${code}`);
        }
    });
});

app.listen(3000, () => {
    console.log('Serwer działa! Wejdź na: http://localhost:3000');
});