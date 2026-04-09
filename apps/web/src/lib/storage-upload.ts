export async function uploadFileToSignedUrl(
  signedUrl: string,
  file: File,
  token?: string
) {
  const response = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: file
  });

  if (!response.ok) {
    throw new Error('Falha ao enviar arquivo para o storage.');
  }
}
