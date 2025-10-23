import { getProductById, postProductComment } from '../Product';

const mockCreate = { get: jest.fn(), post: jest.fn() };
jest.mock('axios', () => ({ create: () => mockCreate }));

describe('Product lib helpers', () => {
  afterEach(() => jest.resetAllMocks());

  test('getProductById - returns product', async () => {
    const fake = { data: { product: { _id: '1', name: 'Test' } } };
    (mockCreate.get as jest.Mock).mockResolvedValueOnce(fake);
    const res = await getProductById('1');
    expect(mockCreate.get).toHaveBeenCalledWith('/api/products/1');
    expect(res).toEqual(fake.data);
  });

  test('postProductComment - posts comment', async () => {
    const fake = { data: { comment: { rating: 5, text: 'Nice' } } };
    (mockCreate.post as jest.Mock).mockResolvedValueOnce(fake);
    const res = await postProductComment('1', { rating: 5, text: 'Nice' });
    expect(mockCreate.post).toHaveBeenCalledWith('/api/products/1/comments', { rating: 5, text: 'Nice' });
    expect(res).toEqual(fake.data);
  });
});
