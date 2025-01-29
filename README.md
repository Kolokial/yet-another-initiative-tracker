# yet-another-initiative-tracker

Yet Another Initiative Tracker

## To Do - High Level

- Condition Reminders - DS
- Custom music per player. Crossfade between. - DS
- Setup DB to hold history.
- ~~investigate websockets to replace webRTC~~
- Need to add a heartbeat for refreshes
- Ability for DMs to have hidden characters in the turn order

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

## Exporting Cert

### Windows

`dotnet dev-certs https --trust; dotnet dev-certs https -ep "$env:USERPROFILE/.aspnet/https/aspnetapp.pfx" -p "SecurePwdGoesHere"`

### Mac/Linux

`dotnet dev-certs https --trust; dotnet dev-certs https -ep "${HOME}/.aspnet/https/aspnetapp.pfx" -p "SecurePwdGoesHere"`

## Building the projects

For the API and SignalR:
`dotnet publish --runtime linux-x64 --configuration Release --self-contained`

For the Angular project:
`npm run build`

## Running the projects locally

API & SignalR
`dotnet watch run --launch-profile https`

Angular
`npm start`
