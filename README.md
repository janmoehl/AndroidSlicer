# AndroidSlicer

This application was generated using JHipster 6.5.1, you can find documentation and help at [https://www.jhipster.tech/documentation-archive/v6.5.1](https://www.jhipster.tech/documentation-archive/v6.5.1).

## Security

With the enhancement of this program, to slice also generic Java programs and not only the android source code, the API was added with the possibility, to get the source code or file content of any file. This is needed to show the user the contents of the Java files he has sliced. But the given file path parameter for this API (`GET /api/java/source-code`) is not checked, so an attacker might be able to read the file contents of every file, to which the Java server has the read-permission on. Since the user can set the Java source-path of a slice, it would not be sufficient to restrict the paths to that parameter of a slice. **So don't make the server public accessible!**

## Development

### Requirements (tested on Linux)

| Requirement | Tested Version | Comment                                                                                           |
| ----------- | -------------- | ------------------------------------------------------------------------------------------------- |
| Java        | OpenJDK 8      | (Version 8 or earlier required by WALA, see [Issue 442](https://github.com/wala/WALA/issues/442)) |
| MongoDB     | 4.2.3          |                                                                                                   |
| WALA        | 1.5.4          |                                                                                                   |

### Installation

Before you can build this project, you must install and configure the following dependencies on your machine:

1. Node.js: We use Node to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.
2. MongoDB: Use a system-wide installation, or the Gradle embedded

#### 1. Node.js

| Operating System | Installation Instructions |
| ---------------- | ------------------------- |
| Windows          |                           |
| Linux (Debian)   |                           |
| Linux (Arch)     | from AUR: `yay -S nodejs` |

After installing Node, you should be able to run the following command to install development tools.
You will only need to run this command when dependencies change in [package.json](package.json).

    npm install

We use npm scripts and [Webpack][] as our build system.

If `jhipster` isn't an executable in your path, try to fix it with `sudo npm install -g generator-jhipster`.

#### 2. MongoDB

| Operating System | Installation Instructions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Windows          | [Download MongoDB](https://www.mongodb.com/download-center/community) server (community edition) from and follow the [installation instructions](https://docs.mongodb.com/manual/administration/install-community/). There is no need to install MongoDB-Compass (GUI for MongoDB). After the binaries are installed, create a folder under C:\data\db run with `mongod` or install the service with `mongod --install`. If you want the databases in a different folder use the `--dbpath` parameter, e.g. `mongod --dbpath=C:\folder\to\databases\data\db` |
| Linux (Debian)   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Linux (Arch)     | `yay -S mongodb-bin`<br />`sudo mkdir -p /data/db`<br />`sudo chown /data/db`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

Or run embedded mongo db with (use `gradle clean` before)

    gradlew -Pembedded-mongo

### Use local WALA

**Note, that WALA 1.5.4 requires Java 8, as Java Version 9 has some breaking changes**.

It could be necessary, to compile a local version of WALA to provide it with the correct paths.

```
git clone https://github.com/wala/WALA
git checkout v1.5.4
```

Edit the file `WALA/com.ibm.wala.core/dat/wala.properties.sample` to match your environment. Unter linux the `java_runtime_dir` might look like `/usr/lib/jvm/default/jre/lib/`. Save it as `WALA/com.ibm.wala.core/dat/wala.properties`.

After that, you can compile it with

```
cd WALA
./gradlew install
```

### Start the Program

Run the following commands in two separate terminals to create a blissful development experience where your browser auto-refreshes when files change on your hard drive.

    ./gradlew -x webpack
    npm start

Npm is also used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by specifying a newer version in [package.json](package.json). You can also run `npm update` and `npm install` to manage dependencies. Add the `help` flag on any command to see how you can use it. For example, `npm help update`.

The `npm run` command will list all of the scripts available to run for this project.

### Debugging Help

Its sometimes helpful, to lookup the current values of the component properties. Instead of just printing them in the template, its much more easier to use a browser plugin for this. Maybe you want to try out [Augury](https://augury.rangle.io/).

### PWA Support

JHipster ships with PWA (Progressive Web App) support, and it's disabled by default. One of the main components of a PWA is a service worker.

The service worker initialization code is commented out by default. To enable it, uncomment the following code in `src/main/webapp/index.html`:

```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').then(function() {
      console.log('Service Worker Registered');
    });
  }
</script>
```

Note: [Workbox](https://developers.google.com/web/tools/workbox/) powers JHipster's service worker. It dynamically generates the `service-worker.js` file.

### Managing dependencies

For example, to add [Leaflet][] library as a runtime dependency of your application, you would run following command:

    npm install --save --save-exact leaflet

To benefit from TypeScript type definitions from [DefinitelyTyped][] repository in development, you would run following command:

    npm install --save-dev --save-exact @types/leaflet

Then you would import the JS and CSS files specified in library's installation instructions so that [Webpack][] knows about them:
Edit [src/main/webapp/app/vendor.ts](src/main/webapp/app/vendor.ts) file:

```
import 'leaflet/dist/leaflet.js';
```

Edit [src/main/webapp/content/scss/vendor.scss](src/main/webapp/content/scss/vendor.scss) file:

```
@import '~leaflet/dist/leaflet.css';
```

Note: There are still a few other things remaining to do for Leaflet that we won't detail here.

For further instructions on how to develop with JHipster, have a look at [Using JHipster in development][].

### Using Angular CLI

You can also use [Angular CLI][] to generate some custom client code. (Installed with `npm install -g @angular/cli`)

For example, the following command:

    ng generate component my-component

will generate few files:

    create src/main/webapp/app/my-component/my-component.component.html
    create src/main/webapp/app/my-component/my-component.component.ts
    update src/main/webapp/app/app.module.ts

## Building for production

### Packaging as jar

To build the final jar and optimize the AndroidSlicer application for production, run:

    gradlew -Pprod clean bootJar

This will concatenate and minify the client CSS and JavaScript files. It will also modify `index.html` so it references these new files.
To ensure everything worked, run:

    java -jar build/libs/*.jar

Then navigate to [http://localhost:8080](http://localhost:8080) in your browser.

Refer to [Using JHipster in production][] for more details.

### Packaging as war

To package your application as a war in order to deploy it to an application server, run:

    gradlew -Pprod -Pwar clean bootWar

## Testing

To launch your application's tests, run:

    ./gradlew test integrationTest jacocoTestReport

### Client tests

Unit tests are run by [Jest][] and written with [Jasmine][]. They're located in [src/test/javascript/](src/test/javascript/) and can be run with:

    npm test

For more information, refer to the [Running tests page][].

### Code quality

Sonar is used to analyse code quality. You can start a local Sonar server (accessible on http://localhost:9001) with:

```
docker-compose -f src/main/docker/sonar.yml up -d
```

You can run a Sonar analysis with using the [sonar-scanner](https://docs.sonarqube.org/display/SCAN/Analyzing+with+SonarQube+Scanner) or by using the gradle plugin.

Then, run a Sonar analysis:

```
./gradlew -Pprod clean check jacocoTestReport sonarqube
```

For more information, refer to the [Code quality page][].

## Using Docker to simplify development (optional)

You can use Docker to improve your JHipster development experience. A number of docker-compose configuration are available in the [src/main/docker](src/main/docker) folder to launch required third party services.

For example, to start a mongodb database in a docker container, run:

    docker-compose -f src/main/docker/mongodb.yml up -d

To stop it and remove the container, run:

    docker-compose -f src/main/docker/mongodb.yml down

You can also fully dockerize your application and all the services that it depends on.
To achieve this, first build a docker image of your app by running:

    gradlew bootJar -Pprod jibDockerBuild

Then run:

    docker-compose -f src/main/docker/app.yml up -d

For more information refer to [Using Docker and Docker-Compose][], this page also contains information on the docker-compose sub-generator (`jhipster docker-compose`), which is able to generate docker configurations for one or several JHipster applications.

## TODO

- Transform the slice-make.component-form into a nested one, with layers for Java and Android specific fields -> better maintainability, better performance when disable/enable these fields .
- Close the security issues with the `GET /api/java/source-code` API (by restricting valid paths to a specific subdirectory?)

## Continuous Integration (optional)

To configure CI for your project, run the ci-cd sub-generator (`jhipster ci-cd`), this will let you generate configuration files for a number of Continuous Integration systems. Consult the [Setting up Continuous Integration][] page for more information.

[jhipster homepage and latest documentation]: https://www.jhipster.tech
[jhipster 6.5.1 archive]: https://www.jhipster.tech/documentation-archive/v6.5.1
[using jhipster in development]: https://www.jhipster.tech/documentation-archive/v6.5.1/development/
[using docker and docker-compose]: https://www.jhipster.tech/documentation-archive/v6.5.1/docker-compose
[using jhipster in production]: https://www.jhipster.tech/documentation-archive/v6.5.1/production/
[running tests page]: https://www.jhipster.tech/documentation-archive/v6.5.1/running-tests/
[code quality page]: https://www.jhipster.tech/documentation-archive/v6.5.1/code-quality/
[setting up continuous integration]: https://www.jhipster.tech/documentation-archive/v6.5.1/setting-up-ci/
[node.js]: https://nodejs.org/
[yarn]: https://yarnpkg.org/
[webpack]: https://webpack.github.io/
[angular cli]: https://cli.angular.io/
[browsersync]: https://www.browsersync.io/
[jest]: https://facebook.github.io/jest/
[jasmine]: https://jasmine.github.io/2.0/introduction.html
[protractor]: https://angular.github.io/protractor/
[leaflet]: http://leafletjs.com/
[definitelytyped]: http://definitelytyped.org/
[mongodb]: https://www.mongodb.com/download-center/community
