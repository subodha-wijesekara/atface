// Smile Logic for Liveness Detection
// We use a geometric approach: "Smile Ratio" usually involves mouth width relative to other face metrics
// or the curvature of the lip corners.

export interface Point {
    x: number;
    y: number;
}

// Check for Smile
export const checkSmile = (landmarks: any): boolean => {
    // face-api.js landmarks (68 points)
    // Mouth Points: 48-67

    // Key Points:
    // Left Corner: 48 (index 48)
    // Right Corner: 54 (index 54)
    // Top Lip Center: 51 (index 51)
    // Bottom Lip Center: 57 (index 57)
    // Nose Tip: 30 (index 30) - Reference for scale

    const leftCorner = landmarks.positions[48];
    const rightCorner = landmarks.positions[54];
    const topLip = landmarks.positions[51];
    const bottomLip = landmarks.positions[57];
    const nose = landmarks.positions[30];

    // 1. Mouth Width
    const mouthWidth = Math.abs(rightCorner.x - leftCorner.x);

    // 2. Face scale (using distance between eyes)
    const leftEyeInner = landmarks.positions[39];
    const rightEyeInner = landmarks.positions[42];
    const eyeDist = Math.abs(rightEyeInner.x - leftEyeInner.x);

    // Filter out bad data
    if (eyeDist === 0) return false;

    // Ratio: Mouth Width / Eye Distance
    // Normal neutral mouth is usually around 1.0 - 1.2 x eyeDist
    // Smiling mouth is usually > 1.3 - 1.4 x eyeDist
    const smileRatio = mouthWidth / eyeDist;

    // Threshold can be tuned.
    // 1.4 is a conservative start for a clear smile.
    return smileRatio > 1.45;
};

// Returns current ratio for UI feedback/debugging
export const getSmileRatio = (landmarks: any): number => {
    const leftCorner = landmarks.positions[48];
    const rightCorner = landmarks.positions[54];
    const leftEyeInner = landmarks.positions[39];
    const rightEyeInner = landmarks.positions[42];

    const mouthWidth = Math.abs(rightCorner.x - leftCorner.x);
    const eyeDist = Math.abs(rightEyeInner.x - leftEyeInner.x);

    if (eyeDist === 0) return 0;
    return mouthWidth / eyeDist;
};
