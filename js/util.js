/* Copyright(C) 2013 Nathan Starkey MIT Licensed*/
/**
@module util
*/
/**
Behaves identically to the C# String.format, where you have
{number} for things that you wish to replace
@class formatstr
@constructor 
@param {String} str The string to format
*/
function formatstr(str) {
    for (i = 1; i < arguments.length; i++) {
        str = str.replace('{' + (i - 1) + '}', arguments[i]);
    }
    return str;
}