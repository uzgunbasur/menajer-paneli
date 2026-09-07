@echo off
chcp 65001 > nul
echo ========================================================
echo  StreamOps CRM - GitHub Pages Otomatik Yukleyici
echo  Hedef: https://github.com/uzgunbasur/menajer-paneli.git
echo ========================================================
echo.

if not exist .git (
    echo [1/4] Git deposu baslatiliyor...
    git init
    git branch -M main
    git remote add origin https://github.com/uzgunbasur/menajer-paneli.git
) else (
    echo [1/4] Git deposu mevcut, remote kontrol ediliyor...
    git remote set-url origin https://github.com/uzgunbasur/menajer-paneli.git
)

echo [2/4] Tum dosyalar ve alt klasorler (css/, js/) ekleniyor...
git add -A

echo [3/4] Commit yapiliyor...
git commit -m "StreamOps v2: GitHub Pages tam klasor yapisi ve goreceli yollar (css, js, nojekyll)"

echo [4/4] GitHub'a gonderiliyor (Push)...
git push -u origin main --force

echo.
echo ========================================================
echo  Tamamlandi! 1-2 dakika icinde GitHub Pages yayini:
echo  https://uzgunbasur.github.io/menajer-paneli/
echo ========================================================
pause
