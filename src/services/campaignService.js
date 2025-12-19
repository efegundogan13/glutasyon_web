import api from './axios';

export const campaignService = {
  // Tüm aktif kampanyaları getir
  getCampaigns: async () => {
    const response = await api.get('/campaigns');
    return response.data;
  },

  // Kampanya detayı
  getCampaign: async (id) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  // Restoran kampanyaları
  getRestaurantCampaigns: async (restaurantId) => {
    const response = await api.get(`/campaigns/restaurant/${restaurantId}`);
    return response.data;
  },

  // Benim kampanyalarım (restoran sahibi)
  getMyCampaigns: async () => {
    const response = await api.get('/campaigns/my');
    return response.data;
  },

  // Kampanya oluştur
  createCampaign: async (formData) => {
    const response = await api.post('/campaigns', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Kampanya güncelle
  updateCampaign: async (id, formData) => {
    const response = await api.put(`/campaigns/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Kampanya sil
  deleteCampaign: async (id) => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  },
};

export default campaignService;
