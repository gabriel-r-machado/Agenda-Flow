import { criarAppointmentAction } from './profile';

// Mock the modules used inside the server action
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    rpc: jest.fn().mockResolvedValue({ data: { success: true, id: 'client-id' }, error: null }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
    },
  })),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({ get: jest.fn().mockReturnValue({ value: 'fake-session-token' }) }),
}));

describe('criarAppointmentAction', () => {
  it('calls RPC and returns success', async () => {
    const res = await criarAppointmentAction('Nome', '11999999999', '00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', new Date().toISOString());
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
  });
});
