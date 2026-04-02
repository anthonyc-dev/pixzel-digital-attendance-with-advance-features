function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return 1;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

function parseDescriptor(descriptor: any): number[] | null {
  if (!descriptor) return null;
  if (Array.isArray(descriptor)) return descriptor;
  if (typeof descriptor === 'string') {
    try {
      const parsed = JSON.parse(descriptor);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return null;
    }
  }
  return null;
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
  threshold = 0.6,
) {
  let bestMatch: typeof employees[0] | null = null;
  let minDistance = 1;

  for (const emp of employees) {
    const descriptor = parseDescriptor(emp.face_descriptor);
    if (!descriptor) continue;

    const distance = euclideanDistance(inputDescriptor, descriptor);

    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = emp;
    }
  }

  console.log('Face match debug:', {
    inputDescriptorLength: inputDescriptor.length,
    bestMatch: bestMatch?.employer_name,
    minDistance,
    threshold,
  });

  if (!bestMatch || minDistance > threshold) {
    return null;
  }

  return { employer_registration: bestMatch, distance: minDistance };
}
