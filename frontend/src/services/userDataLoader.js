export async function fetchUserData(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (res.status === 401) {
      throw new Response(JSON.stringify({ message: 'Unauthorized access' }), { status: res.status });
    }

    if (!res.ok) {
      throw new Response(`Error: ${res.status} - ${res.statusText}`, {
        status: res.status,
        statusText: res.statusText,
      });
    }

    const data = await res.json();
    return { data };
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export const applicantLoader = () => fetchUserData('http://localhost:3000/applicant/root');
export const validatorLoader = () => fetchUserData('http://localhost:3000/validator/root');
