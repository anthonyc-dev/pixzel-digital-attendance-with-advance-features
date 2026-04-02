function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return 1;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

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

    const distance = euclideanDistance(inputDescriptor, emp.face_descriptor);

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
