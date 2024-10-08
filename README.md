# yet-another-initiative-tracker

Yet Another Initiative Tracker

## To Do - High Level

- Condition Reminders - DS
- Custom music per player. Crossfade between. - DS
- Setup DB to hold history.
- investigate websockets to replace webRTC

## Development setup

On Linux, you'll need to install the dotnet SDK.

[Microsofts Guide](https://learn.microsoft.com/en-us/dotnet/core/install/linux-debian])
or use the following commands.

```
wget https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
```

Then you'll need to Development certificates

```
dotnet dev-certs https
dotnet dev-certs https --check
dotnet dev-certs https --trust
```
