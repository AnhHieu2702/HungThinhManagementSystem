package com.apartment.exceptions;

public class UserMessageException extends RuntimeException{
    public UserMessageException(String message)
    {
        super(message);
    }
}
