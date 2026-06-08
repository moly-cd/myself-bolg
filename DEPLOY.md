# Deployment

This Hugo site is deployed to:

- Domain: `https://momoxjk.xyz/`
- Server: configured locally
- Web root: `/var/www/myself-bolg`

## One-command deploy

Run this from PowerShell:

```powershell
cd D:\Github-nunocoracao\myself-bolg
.\deploy.ps1
```

The script will:

1. Build the Hugo site.
2. Pack `public/` into `public.tar.gz`.
3. Upload it to `/tmp/public.tar.gz`.
4. Replace `/var/www/myself-bolg` on the server.
5. Reload Nginx.

If the server asks for a password, enter your VPS password. To avoid typing a password every time, configure SSH key login later.
