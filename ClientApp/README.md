### How to Run MFE Apps on Local Machine

1.  Goto ui.wings.Web\ClientApp\
2.  run command yarn install 
    Note: this needs to be run one time only or if settings on new machine or there is any package related changes
3.  After successful installation
4.  goto ClientApp\apps\host\src\appUrls.js change the url to local url of app which you want to run
    i.e for airport app we user airports: 'https://localhost:9003'
    note: to find the port of the app goto ClientApp\apps\Your-App-Name\craco.config.js on bottom of file we have provided the port.
    i.e for airport app it is 9003
5.  Start MFE APP using start:mfe and select app from options
6.  goto https://localhost:9000


### How to Test Changes Locally when working inside the packages folder 
1. Gogo Your package folder i.e ui.wings.Web\ClientApp\packages\Core
2. Run command "yarn link" it will create a link for your local package 
3. Run command "yarn start" to compile your package. Note: Keep it running while working on package
3. Now goto root of the app i.e ui.wings.Web\ClientApp\
4. Run command yarn link @wings-shared/core  -- this name coming from ui.wings.Web\ClientApp\packages\Core\package.json file under your package.
5. Run your MFE App and it will automatically pickup the latest changes from that package.
6. When you have verified your changes on your local machine then it's time to publish your changes to azure the artifacts.
7. We can publish package using command "yarn publish --no-git-tag-version"
8. Make sure you use --no-git-tag-version this help us to avoid generation of tags in code repo

### Add New MFE App
To add new MFE app we needs to do follow these steps by changing the app name with your new app name
here i.e name registry will be replaced by the New App Name

### FAQ
Q: My PR is merged but changes are not reflected
Ans: Make sure you have updated the package version on location where from you are using it.

Q: I have Updated the package version but still issue
Ans: Let's try with hard refresh using CTRl + F5 key in chrome browser