import * as faceapi from "@vladmandic/face-api";

export function findBestMatch(
  inputDescriptor: number[],
  employees: {
    id: string;
    employer_id: string;
    employer_name: string;
    employer_position: string;
    image: string;
    face_descriptor: number[];
  }[],
  threshold = 0.5,
) {
  let bestMatch = null;
  let minDistance = 1;

  for (const emp of employees) {
    if (!emp.face_descriptor) continue;

    const distance = faceapi.euclideanDistance(
      inputDescriptor,
      emp.face_descriptor,
    );

    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = emp;
    }
  }

  if (!bestMatch || minDistance > threshold) {
    return null;
  }

  return { employer_registration: bestMatch, distance: minDistance };
}
