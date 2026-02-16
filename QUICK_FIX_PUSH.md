# Quick Fix - Push to QClearance Repository

## 🚨 Current Issue
- Remote already exists pointing to old repository
- Need to update to new repository: https://github.com/PraveenDommeti/QClearance.git
- Branch name mismatch (trying to push 'main' but it doesn't exist)

## ✅ Solution - Run These Commands

```bash
# 1. Update the remote URL to your new repository
git remote set-url origin https://github.com/PraveenDommeti/QClearance.git

# 2. Check current branch name
git branch

# 3. If you're on 'master' branch, rename it to 'main' (optional but recommended)
git branch -M main

# 4. Add all files
git add .

# 5. Commit all changes
git commit -m "feat: Complete Sky Guardian QClearance system - Production ready"

# 6. Push to the new repository (first time push)
git push -u origin main --force
```

## 🎯 Alternative: If you want to keep it simple

```bash
# Just update remote and force push
git remote set-url origin https://github.com/PraveenDommeti/QClearance.git
git add .
git commit -m "feat: Complete Sky Guardian QClearance system"
git branch -M main
git push -u origin main --force
```

## ⚡ One-Line Command (Copy & Paste All at Once)

```bash
git remote set-url origin https://github.com/PraveenDommeti/QClearance.git && git add . && git commit -m "feat: Complete Sky Guardian QClearance system" && git branch -M main && git push -u origin main --force
```

---

## 📝 What Each Command Does

1. **`git remote set-url origin https://github.com/PraveenDommeti/QClearance.git`**
   - Updates your remote to point to the new QClearance repository

2. **`git add .`**
   - Stages all your files for commit

3. **`git commit -m "..."`**
   - Creates a commit with all your changes

4. **`git branch -M main`**
   - Renames your current branch to 'main' (GitHub's default)

5. **`git push -u origin main --force`**
   - Pushes to GitHub (--force overwrites any existing content)

---

## ✅ After Successful Push

Verify on GitHub:
- Go to: https://github.com/PraveenDommeti/QClearance
- Check that all files are there
- Verify README displays correctly
- Confirm .env is NOT visible

---

**Ready to push!** 🚀
