## CLI

To deprecate multiple versions at once:

```powershell
for ($version = 44; $version -le XX; $version++) {
    npm deprecate writedocs@1.1.$version "Deprecated version"
}
```
