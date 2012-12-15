function asa_rstr2b64(input) {
    "use strict";
    var tab = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
        output = "",
        len = input.length,
        i,
        j,
        chunk32;
    for (i = 0; i < len; i += 4) {
        chunk32 = (input.charCodeAt(i + 3) << 24)
                    | (input.charCodeAt(i + 2) << 16)
                    | (input.charCodeAt(i + 1) << 8)
                    | (input.charCodeAt(i));
        for (j = 0; j < 4; j++) {
            output += tab.charAt((chunk32 >>> (6 * j) & 0x3F));
        }
    }
    return output;
}

function saltPassword(username, password, saltLength) {
    "use strict";
    return password + username.slice(0, saltLength);
}

function truncate(s, len) {
    "use strict";
    return s.trim().slice(0, len);
}

function rightPad(s, len) {
    "use strict";
    return s.concat(new Array(len - s.length + 1).join("\x00"));
}

function asa_md5(s) {
    "use strict";
    return asa_rstr2b64(rstr_md5(s));
}

function generate_encrypted_password(username, password, passLength) {
    "use strict";
    var sp, passwordLength, saltLength, padLen = 0, truncLen = 0;
    passwordLength = password.length;
    if (passLength == 16 && passwordLength > 2 && passwordLength <= 16) {
        padLen = 16;
        truncLen = 16;
        saltLength = 4;
    } else if (passwordLength > 2 && (passwordLength <= 12)) {
        padLen = 16;
        truncLen = 16;
        saltLength = 4;
    } else if (passwordLength > 12 && (passwordLength < passLength - 4)) {
        padLen = 32;
        truncLen = 32;
        saltLength = 4;
    } else if ((passwordLength >= passLength - 4) && (passwordLength <= passLength)) {
        padLen = 32;
        truncLen = 32;
        saltLength = 0;
    } else {
        return "Passwords must be between 3 and " + passLength + " characters"; // limits seen through trial on ASA 8.2(3)
    }
    sp = saltPassword(username, password, saltLength);
    return asa_md5(rightPad(truncate(sp, truncLen), padLen));
}
