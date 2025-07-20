export enum VALIDATION_REGEX {
    ONE_WHITESPACE_STRING = '/^(?!\\s)[^\\s]{1,}/',
    TWO_WHITESPACE_STRING = '/^(?!\\s)[^\\s]{2,}/',
    THREE_WHITESPACE_STRING = '/^(?!\\s)[^\\s]{3,}/',
    FOUR_WHITESPACE_STRING = '/^(?!\\s)[^\\s]{4,}/',
    FIVE_WHITESPACE_STRING = '/^(?!\\s)[^\\s]{0,}/',
    NO_WHITESPACE = '/^[^\\s]+$/',
    MAX_CHARACTOR_LENGTH_100 = '100'
    
}
