# @getvero/tracking

[![NPM Version](https://img.shields.io/npm/v/%40getvero%2Ftracking)](https://www.npmjs.com/package/@getvero/tracking)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/%40getvero%2Ftracking)](https://bundlephobia.com/package/@getvero/tracking)

[Vero](https://www.getvero.com/) is an email marketing platform that allows you to engage and re-engage your
customer base based on the actions they perform in your software.

This NPM package is the official JavaScript/TypeScript library that allows you to interact with Vero's
[tracking API](https://developers.getvero.com/track-api-reference/) from your JavaScript application with ease.

This library works in both Node.js and browser environments.

## Usage

To get started with this library, you'll need to obtain your tracking API key from
the [Vero Settings page](https://connect.getvero.com/settings/project/tracking-api-keys) for your project.

There are two methods to reference this library in your project:

### Method 1: `<script>` Tag

This is the simplest way to use this library in your project if you want to track events and user properties
on the client-side of your website.

Insert the following code into your `<head>` section of your HTML document:

```html
<script src="https://cdn.jsdelivr.net/npm/@getvero/tracking@1.3.0/dist/index.window.js"></script>
<script>
    vero.tracker.init({
        trackingApiKey: "<YOUR_TRACKING_API_KEY_HERE>"
    })
</script>
```

When the user logs in, you should call the `user.identify` method:

```javascript
vero.tracker.user.identify({
    id: "<USER_ID_HERE>",
    email: "<USER_EMAIL_HERE>"
})
```

To track an event, you can call the `event.track` method:

```javascript
vero.tracker.event.track({
    eventName: "<EVENT_NAME_HERE>",
    data: {
        // Add any additional data you want to track
    }
})
```

Please make sure you have called `user.identify` before calling `event.track` so the event can be attributed to the
correct user. Otherwise, the `event.track` call will throw an error.

When the user logs out, you should call `vero.tracker.user.unidentify()` so future events will not be accidentally
associated with the user.

### Method 2: NPM Package

This is the recommended way to use this library on both client-side and server-side of your website.

First, install the `@getvero/tracking` package:

```bash
npm install @getvero/tracking
```

If you only need one instance of the `Tracker` class (singleton), this package's default export will work for you:

```javascript
// Put this in the entry point of your application

import tracker from '@getvero/tracking'

tracker.init({
    trackingApiKey: "<YOUR_TRACKING_API_KEY_HERE>"
})
```

You can then use the singleton `tracker` instance to track events and user properties:

```javascript
import tracker from '@getvero/tracking'

tracker.user.identify({
    id: "<USER_ID_HERE>",
    email: "<USER_EMAIL_HERE>"
})

tracker.event.track({
    // The `identity` is required in Node.js environment as `user.identify` doesn't remember the user's identity 
    // unlike in a browser environment
    identity: {
        userId: "<USER_ID_HERE>",
        email: "<USER_EMAIL_HERE>"
    },
    eventName: "<EVENT_NAME_HERE>",
    data: {
        // Add any additional data you want to track
    }
})
```

If you need multiple instances of the `Tracker` class, you can use the named export:

```javascript
import {Tracker} from '@getvero/tracking'

const tracker = new Tracker({
    trackingApiKey: "<YOUR_TRACKING_API_KEY_HERE>"
})

tracker.user.identify({
    id: "<USER_ID_HERE>",
    email: "<USER_EMAIL_HERE>"
})

tracker.event.track({
    // The `identity` is required in Node.js environment as `user.identify` doesn't remember the user's identity 
    // unlike in a browser environment
    identity: {
        userId: "<USER_ID_HERE>",
        email: "<USER_EMAIL_HERE>"
    },
    eventName: "<EVENT_NAME_HERE>",
    data: {
        // Add any additional data you want to track
    }
})
```

In browser environments, when the user logs out, you should call `user.unidentify()` so future events will not be
accidentally associated with the user:

```javascript
tracker.user.unidentify()
```

For more details about the methods and their usages, please refer to the TypeScript type definitions and the JSDoc
comments.

## Feedback and Contributions

We welcome feedback and contributions from the community.

If you have any questions or suggestions, please open an issue on GitHub or reach out to us
at [support@getvero.com](mailto:support@getvero.com).

Pull requests are welcome.

## License

This library is distributed under the MIT License. See [LICENSE](LICENSE) for more information.
