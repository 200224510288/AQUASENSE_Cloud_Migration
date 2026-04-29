export type Customer = {
  customer_id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_CUSTOMER_API_URL;

export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch(`${BASE_URL}/customers`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch customers");
  }

  return res.json();
}

export async function createCustomer(data: {
  name: string;
  email: string;
  phone: string;
}) {
  const res = await fetch(`${BASE_URL}/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create customer");
  }

  return res.json();
}
