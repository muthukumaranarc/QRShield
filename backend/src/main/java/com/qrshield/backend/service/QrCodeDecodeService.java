package com.qrshield.backend.service;

import com.google.zxing.BinaryBitmap;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.InputStream;

@Service
public class QrCodeDecodeService {

    private static final Logger log = LoggerFactory.getLogger(QrCodeDecodeService.class);

    /**
     * Decodes QR code content from an uploaded image file
     */
    public String decodeQrCodeImage(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("No image file provided");
        }

        try (InputStream inputStream = file.getInputStream()) {
            BufferedImage bufferedImage = ImageIO.read(inputStream);
            if (bufferedImage == null) {
                throw new IllegalArgumentException("Could not parse image. Please upload a valid PNG, JPG, or WEBP file.");
            }

            BufferedImageLuminanceSource source = new BufferedImageLuminanceSource(bufferedImage);
            BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));

            Result result = new MultiFormatReader().decode(bitmap);
            return result.getText();
        } catch (com.google.zxing.NotFoundException e) {
            log.warn("No QR code detected in image: {}", file.getOriginalFilename());
            throw new IllegalArgumentException("No QR code found in the uploaded image. Please ensure the QR code is clearly visible and well-lit.");
        }
    }
}
