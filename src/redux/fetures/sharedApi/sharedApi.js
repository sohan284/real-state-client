import { baseApi } from "../../api/baseApi";

const sharedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({    

    getPropertieUnits: builder.query({
      query: (id) => {
        return {
            url: `/admin/propertie-units/${id}`,
            method: "GET",
        };
    },
    providesTags: ["properties"],
    }),

    
    getSingleTenantDetailse : builder.query({
      query: (id)=>{
        return {
          url: `/admin/getSingleTenantDetailse/${id}`,
          method: "GET",
        }
      },
    })



  }),
});

export default sharedApi;
