@echo off
REM Quick Git Push Script for Sky Guardian
REM This script automates the git push process

echo ========================================
echo Sky Guardian - Git Push Helper
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo Step 1: Checking Git status...
git status
echo.

echo Step 2: Adding all files to staging...
git add .
echo.

echo Step 3: Creating commit...
set /p commit_msg="Enter commit message (or press Enter for default): "

if "%commit_msg%"=="" (
    set commit_msg=feat: Production-ready updates - Professional UI, Netlify config, comprehensive docs
)

git commit -m "%commit_msg%"
echo.

echo Step 4: Checking remote repository...
git remote -v
echo.

set /p remote_url="Enter GitHub repository URL (or press Enter to skip): "

if not "%remote_url%"=="" (
    echo Adding/updating remote origin...
    git remote remove origin 2>nul
    git remote add origin %remote_url%
)

echo Step 5: Pushing to GitHub...
echo.
echo Choose push method:
echo 1. Normal push (git push origin main)
echo 2. Force push (git push origin main --force)
echo 3. First push (git push -u origin main)
echo.

set /p push_choice="Enter choice (1-3): "

if "%push_choice%"=="1" (
    git push origin main
) else if "%push_choice%"=="2" (
    echo WARNING: This will overwrite remote repository!
    set /p confirm="Are you sure? (yes/no): "
    if "%confirm%"=="yes" (
        git push origin main --force
    ) else (
        echo Push cancelled.
    )
) else if "%push_choice%"=="3" (
    git push -u origin main
) else (
    echo Invalid choice. Using normal push...
    git push origin main
)

echo.
echo ========================================
echo Push complete!
echo ========================================
echo.
echo Next steps:
echo 1. Verify files on GitHub
echo 2. Deploy to Netlify (see NETLIFY_DEPLOYMENT_GUIDE.md)
echo 3. Create YouTube video (see YOUTUBE_UPLOAD_GUIDE.md)
echo.
pause
