import api from './api';

export interface School {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  is_active: boolean;
  supervisor?: {
    id: string;
    name: string;
    phone: string;
  };
}

const superAdminService = {
  getSchools: async () => {
    const response = await api.get('/super-admin/schools');
    return response.data;
  },
  
  createSchool: async (data: { supervisor_name: string; supervisor_phone: string; school_name?: string }) => {
    const response = await api.post('/super-admin/schools', data);
    return response.data;
  },
  
  updateSchool: async (id: string, data: Partial<School>) => {
    const response = await api.put(`/super-admin/schools/${id}`, data);
    return response.data;
  },
  
  deleteSchool: async (id: string) => {
    const response = await api.delete(`/super-admin/schools/${id}`);
    return response.data;
  }
};

export default superAdminService;
