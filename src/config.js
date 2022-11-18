export default {
    // This is the URL used for requests to the ViUR application
    apiUrl: import.meta.env.DEV ? "http://localhost:8080" : window.location.origin,
    staticFolder: "/static"
}
