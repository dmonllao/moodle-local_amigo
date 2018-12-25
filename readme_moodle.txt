To install Crypto-JS dependencies

# Install crypto-js (bower install crypto-js)
# Open bower_components/crypto-js/aes.js and copy the list of dependencies (e.g. /core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"])
# Copy bower_components/crypto-js/aes.js and all the other dependencies to local/amigo/src/
# Also add ./hmac.js and ./sha1.js, they are ./evpkdf.js dependencies.
# Test that there are no JS errors and install the new dependencies if something is missing (the amigo is loaded on each footer renderer so you should see JS errors on each Moodle page if any new dependency is missing).
