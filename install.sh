#! /bin/sh



cd app
npm install

cd ../YetAnotherInitiativeTrackerAPI
dotnet restore

dotnet dev-certs https -ep %USERPROFILE%\.aspnet\https\aspnetapp.pfx
dotnet dev-certs https --trust