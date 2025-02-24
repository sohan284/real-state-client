import { baseApi } from "../../api/baseApi";

const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getALlUser: builder.query({
      query: (query) => {
        const queryString = new URLSearchParams(query).toString();
        return {
          url: `/auth/allUsers?${queryString}`,
          method: "GET",
        };
      },
      providesTags: ["user"],
    }),

    getAllProperties: builder.query({
      query: (selectedDate) => {
        return {
          url: selectedDate
            ? `/admin/getAllProterties?selectedDate=${selectedDate}`
            : `/admin/getAllProterties`,
          method: "GET",
        };
      },
      providesTags: ["properties"],
    }),


    // getAllProperties: builder.query({
    //   query: (selectedDate) => {
    //     return {
    //       url: `/admin/getAllProterties?selectedDate=${selectedDate}`,
    //       method: "GET",
    //     }
    //   },
    //   providesTags: ["properties"],
    // }),

    getAllTenants: builder.query({
      query: () => {
        return {
          url: `/admin/getALlTenants`,
          method: "GET",
        }
      },
      providesTags: ["tenants"],
    }),

    getSingleOwnerAllPropertiesWithOwnerInfo: builder.query({
      query: (id) => {
        return {
          url: `/admin/getSingleOwnerAllPropertiesWithOwnerInfo/${id}`,
          method: "GET",
        };
      },
      providesTags: ["properties", "user"],
    }),



    // =================================================>>>>  All data overview
    getAllDataOverviewByAdmin: builder.query({
      query: (selectedDateForFilter) => {
        return {
          url: `/admin/getAllDataOverviewByAdmin?selectedDate=${selectedDateForFilter}`,
          method: "GET",
        };
      },
      providesTags: ["overview"],
    }),

    // =================================================>>>>  Create Plan
    getPlan: builder.query({
      query: () => {
        return {
          url: `/admin/getPlan`,
          method: "GET",
        };
      },
      providesTags: ["plan"],
    }),

    createPlan: builder.mutation({
      query: (planData) => {
        return {
          url: `/admin/createPlan`,
          method: "POST",
          body: planData
        };
      },
      invalidatesTags: ["plan"],
    }),



    // ================================================  Payout Api
    payoutDataGetByAdmin: builder.query({
      query: () => {
        return {
          url: `/payment/payoutDataGetByAdmin`,
          method: "GET",
        };
      },
      providesTags: ["payout"],
    }),

    sendPayoutRequestByAdmin: builder.mutation({
      query: (data) => {
        return {
          url: `/payment/sendPayoutRequestByAdmin`,
          method: "POST",
          body: data
        };
      },
      invalidatesTags: ["payout"],
    }),

    // =======================================>>>>> tenant payment create by admin
    tenantPayment: builder.query({
      query: () => {
        return {
          url: `/payment/tenantPayment`,
          method: "GET",
        };
      },
      invalidatesTags: ["payment"],
    }),

    // =======================================>>>>> delete non-subscriber owner 
    deleteNoSubscriberOwner: builder.mutation({
      query: (ownerId) => {
        return {
          url: `/admin/deleteNoSubscriberOwner/${ownerId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["user"],
    }),


    // =======================================>>>>> Rwview API
    getAllReview: builder.query({
      query: () => {
        return {
          url: `/admin/getAllReview`,
          method: "GET",
        };
      },
      providesTags: ["review"],
    }),

    deleteReviewByAdmin: builder.mutation({
      query: (id) => {
        return {
          url: `/admin/deleteReviewByAdmin/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["review"],
    }),

  }),
});

export default adminApi;
