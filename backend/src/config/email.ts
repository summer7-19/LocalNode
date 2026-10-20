import nodemailer from 'nodemailer';
import {config}from './env';
const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
}= config.SMTP;

if(!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    throw new Error('Email configuration is missing');
}

export const emailTransporter=nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure:SMTP_SECURE==="true",
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    }
})

export const emailFrom=SMTP_FROM;