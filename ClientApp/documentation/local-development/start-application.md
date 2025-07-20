# Starting Local Development Servers

## Local Development Servers for **ALL** Applications (Resource Intensive):

1. Open a console at the ./ClientApp directory
2. run: **"yarn"** (to install all local library files)
3. allow local install to complete
4. run: **'yarn start:dev'**
5. allow compilation of apps to complete (will be slow when loading all applications)
6. Navigate to the webpage for the **Host** application to see the Wings Application running
   - defaults to **https://localhost:9000/**

> _WARNING: since local apps are run using HTTPS you may need to follow the dialog instructions that appear on the pages in order to allow your browser to load them normally_

## Local Development Servers for **PARTICULAR** Applications:

1. Open a terminal at the ./ClientApp directory
2. run: **"yarn"** (to install all local library files)
3. allow local install to complete
4. run: **'yarn start:shared'** (this will start all core applications)
5. open a separate terminal at the ./ClientApp directory
6. run: **'yarn dev:name-of-application'** e.g. 'yarn dev:airports'
7. allow compilation of apps to complete (will be slow when loading all applications)
8. Navigate to the webpage for the **Host** application to see the Wings Application running
   1. defaults to **https://localhost:9000/**
   2. Wings will navigate to a particulacular application by default so you may need to change the url endpoint e.g. **https://localhost:9000/name-of-application**

> _WARNING: since local apps are run using HTTPS you may need to follow the dialog instructions that appear on the pages in order to allow your browser to load them normally_
