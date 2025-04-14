import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    bgColor?: string;
    fgColor?: string;
    includeMargin?: boolean;
}

export default function QRCode({
    value,
    size = 200,
    level = 'M',
    bgColor = '#FFFFFF',
    fgColor = '#000000',
    includeMargin = true,
}: QRCodeProps) {
    return (
        <QRCodeSVG
            value={value}
            size={size}
            level={level}
            bgColor={bgColor}
            fgColor={fgColor}
            includeMargin={includeMargin}
        />
    );
}
