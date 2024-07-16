const { shell } = require('electron');
const Logger = require('../utils/log');
const auth = require('../base/authentication');
const { UIError } = require('../utils/errors');

const log = new Logger('Router:Authentication');
log.debug('Loaded');

module.exports = router => {

  // Checks and sets the API hostname
  router.serve('auth/check-hostname', async request => {

    try {

      // Trying the exact URL provided first
      if (await auth.setHostname(request.packet.body.hostname))
        return request.send(200, {});

      return request.send(404, {});

    } catch (error) {

      return request.send(400, {});

    }

  });

  // Is authentication required
  router.serve('auth/is-authentication-required', async req => {

    req.send(200, { required: (await auth.isAuthenticationRequired()) });

  });

  // Login
  router.serve('auth/authenticate', async request => {

    // Getting request properties
    const { username, password } = request.packet.body;

    // Checking input parameters prescense
    if (typeof username !== 'string' || typeof password !== 'string') {

      request.send(400, { error: 'Incorrect credentials' });
      return;

    }

    // Calling authentication function
    try {

      console.log('In auth handle funcation');
      // Making authentication request
      const authResponse = await auth.userAuthentication(username, password);

      // Returning authenticated user object to renderer
      request.send(200, authResponse);

    } catch (error) {

      // Pass UIErrors directly to renderer
      if (error instanceof UIError) {

        request.send(error.code, { message: error.message, id: error.errorId });
        return;

      }

      // It'll be extremely weird if real errors will occur there. We should log them.
      log.error('Operating error occured in authentication route', error);
      request.send(500, { message: 'Internal error occured', id: 'EISR000' });

    }

  });

  // Logout
  router.serve('auth/logout', async request => {

    try {

      await auth.logout();

    } catch (error) {

      // Return UIErrors
      if (error instanceof UIError) {

        request.send(error.code, { message: error.message, id: error.errorId });
        return;

      }

      // Wrap and log all other kinds of errors
      log.error('Operating error occured in logout route', error);
      request.send(500, { message: 'Internal error occured', id: 'EISR000' });

    }

  });

  // Request for a single-click redirection URL
  router.serve('auth/request-single-click-redirection', async request => {

    try {

      // Get URL
      const url = await auth.getSingleClickRedirection();

      // Open this URL in system's browser
      shell.openExternal(url);

      // Return successfull status
      request.send(200, {});
      return;

    } catch (error) {

      // Return UIErrors
      if (error instanceof UIError) {

        request.send(error.code, { message: error.message, id: error.errorId });
        return;

      }

      // Wrap and log all other kinds of errors
      log.error('Operating error occured in the single click redirection route', error);
      request.send(500, { message: 'Internal error occured', id: 'EISR000' });

    }

  });

  // Request for a Web-Desktop SSO check
  router.serve('auth/check-sso-presence', async request => {

    try {

      // Get properties
      const ssoParams = auth.getSSOFromProtocol();
      if (ssoParams)
        return request.send(200, ssoParams);

      return request.send(404, {});

    } catch (error) {

      // Return UIErrors
      if (error instanceof UIError)
        return request.send(error.code, { message: error.message, id: error.errorId });


      // Wrap and log all other kinds of errors
      log.error('Operating error occured in the single click redirection route', error);
      return request.send(500, { message: 'Internal error occured', id: 'EISR000' });

    }

  });

  // Performs a Web-Desktop SSO login
  router.serve('auth/perform-sso', async request => {

    try {

      // Get properties
      const ssoParams = request.packet.body;

      // Set base url
      if (!(await auth.setHostname(ssoParams.baseUrl)))
        return request.send(400, { message: 'Single-Sign On URL is not correct', id: 'ESSO001' });

      // Try to authenticate
      await auth.authenticateSSO(ssoParams);
      return request.send(200, {});

    } catch (error) {

      // Return UIErrors
      if (error instanceof UIError)
        return request.send(error.code, { message: error.message, id: error.errorId });


      // Wrap and log all other kinds of errors
      log.error('Operating error occured in the single click redirection route', error);
      return request.send(500, { message: 'Internal error occured', id: 'EISR000' });

    }

  });

  // Pass company identifier to Sentry on frontend
  auth.events.once('company-instance-fetched', cid => router.emit('auth/company-instance-fetched', { cid }));

  // Pass detected SSO URLs from duplicating instances
  auth.events.on('sso-detected', ssoParams => router.emit('auth/sso-detected', ssoParams));

};
