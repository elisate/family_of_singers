import { http } from './client.js';

// Auth
export const AuthApi = {
  register: (payload) => http.post('/auth/register', payload),
  login: (payload) => http.post('/auth/login', payload),
  me: () => http.get('/auth/me')
};

// Members (custom routes)
export const MembersApi = {
  create: (formData) => http.post('/member/addmember', formData), // expects FormData with field "image"
  list: () => http.get('/member/list'),
  getById: (id) => http.get(`/member/getMemberbyId/${id}`),
  getByName: (name) => http.get(`/member/getMemberbyname/${encodeURIComponent(name)}`),
  update: (id, payload) => http.put(`/member/UpdateMember/${id}`, payload),
  remove: (id) => http.delete(`/member/deleteMember/${id}`)
};

// Generic helpers for CRUD-style resources
function makeCrud(resourcePath) {
  return {
    list: (query) => http.get(`/${resourcePath}`, { query }),
    get: (id) => http.get(`/${resourcePath}/${id}`),
    create: (payload) => http.post(`/${resourcePath}`, payload),
    update: (id, payload) => http.put(`/${resourcePath}/${id}`, payload),
    remove: (id) => http.delete(`/${resourcePath}/${id}`)
  };
}

export const ScheduleApi = makeCrud('schedule');
export const CommissionApi = makeCrud('commission');
export const EventApi = makeCrud('event');
export const DonationApi = {
  ...makeCrud('donation')
  // Note: donation POST does not require auth per backend
};
export const ContentApi = makeCrud('content');

// Media has CRUD plus upload endpoint
export const MediaApi = {
  ...makeCrud('media'),
  upload: (formData) => http.post('/media/upload', formData)
};


