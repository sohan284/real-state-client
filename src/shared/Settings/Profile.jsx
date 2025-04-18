/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
import { useSelector } from "react-redux";
import authApi from "../../redux/fetures/auth/authApi";
import { selectCurrentUser } from "../../redux/fetures/auth/authSlice";
import { MapPin, UserPen } from "lucide-react";
import { Link } from "react-router-dom";
import { url } from "../../globalConst/const";
import { FaRegUser } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "sonner";
import tenantApi from "../../redux/fetures/tenant/tenantApi";
import adminApi from "../../redux/fetures/admin/adminApi";
import { Button } from "antd";
import { useForm } from "react-hook-form";
import { skipToken } from "@reduxjs/toolkit/query";
import ownerApi from "../../redux/fetures/owner/ownerApi";
import { useState } from "react";

const UserProfile = () => {
    const [cancelsubscription] = authApi.useCancelsubscriptionMutation();
    const [sendPayoutRequestByOwner, { isLoading: payoutIsLoading }] = ownerApi.useSendPayoutRequestByOwnerMutation();
    const [CreateRunningMonthTenantPaymentsDataByOwner, { isLoading: createTenamtPaymentIsLoading }] = ownerApi.useCreateRunningMonthTenantPaymentsDataByOwnerMutation();
    const [sendDueReminderEmailToTenant, { isLoading: emailReminderIsLoading }] = ownerApi.useSendDueReminderEmailToTenantMutation();
    const [isCancel, setCancel] = useState(false)


    const currentUser = useSelector(selectCurrentUser);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const { data, isLoading, error } = authApi.useGetSingleUserInfoQuery(
        currentUser?.email,
        {
            pollingInterval: 5000
        }
    );

    let tenantWithOwnerData
    if (currentUser?.role === "tenant") {
        const { data: tenantDatas } = tenantApi.useGetTenantDetailseQuery(currentUser?.userId);
        tenantWithOwnerData = tenantDatas?.data?.ownerId
    }
    const { data: getPlanData } = adminApi.useGetPlanQuery(currentUser.role !== "admin" && skipToken)
    const [planData] = adminApi.useCreatePlanMutation()

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error fetching user information</p>;



    const userInfo = data?.data || {};
    const {
        name,
        email,
        profileImage,
        permanentAddress,
        personalInfo,
        numberOfProperty,
        numberOfTotalUnits,
        totalAmount,
        totalRentAmount,
    } = userInfo;

    const cancelsubscriptionFun = async () => {

        Swal.fire({
            title: "Are you sure?",
            text: "You won't cancel your plan",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, cancel it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                setCancel(true)
                const res = await cancelsubscription(currentUser?.customerId)
                if (res.data?.subscriptionId) {
                    toast.success(res.data.message)
                    setCancel(false)
                }
            }
        });
    }

    const onSubmit = async (formData) => {
        const updatedData = {
            starter: formData.starter ?? getPlanData?.data?.[0]?.starter ?? 0,
            growth: formData.growth ?? getPlanData?.data?.[0]?.growth ?? 0,
            professional: formData.professional ?? getPlanData?.data?.[0]?.professional ?? 0,
        };

        const res = await planData(updatedData);
        if (res.data.success) {
            toast.success(res.data.message);
            reset()
        }
    };

    const openPayout = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };


    const AddPayoutAccoutnByOwner = async (email) => {
        const updatedData = { email };
        const res = await sendPayoutRequestByOwner(updatedData);
        if (res?.data?.success) {
            toast.success(res?.data?.message);
            await openPayout(res?.data?.data?.onboardingUrl);
        } else {
            if (res?.data?.success) {
                await openPayout(res?.data?.data?.onboardingUrl);
            } else {
                toast.error(res?.data?.message || '❌ Something went wrong!');
            }
        }
    };


    const createTenantPaymentByOwnerHandler = async (ownerId) => {
        const res = await CreateRunningMonthTenantPaymentsDataByOwner(ownerId)
        if (res?.data?.success) {
            toast.success(res?.data?.message)
        }
    }

    const sendEmailReminderToTenantHandler = async (ownerId) => {
        const res = await sendDueReminderEmailToTenant(ownerId)
        console.log(res);

        if (res?.data?.success) {
            toast.success(res?.data?.message)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="col-span-3">
                {
                    currentUser.role === "admin" &&
                    <div>
                        <div className=" mx-auto p-6 bg-white rounded-xl shadow-lg border">
                            <h2 className="text-xl font-semibold text-center mb-4">Subscription Plans</h2>
                            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                                <div className="mb-4">
                                    <label htmlFor="starter" className="block text-sm font-medium text-gray-700">
                                        Starter
                                    </label>
                                    <input
                                        {...register("starter", {
                                            valueAsNumber: true,
                                            required: "Starter plan price is required",
                                        })}
                                        type="number"
                                        id="starter"
                                        placeholder={`Enter Starter Plan Price . Resent Price ${getPlanData?.data?.[0]?.starter ?? 0} `}
                                        className="mt-1 p-2 border border-gray-300 rounded w-full"
                                    />
                                    {errors.starter && (
                                        <p className="text-red-500 text-sm">{errors.starter?.message}</p>
                                    )}
                                </div>

                                {/* Growth Plan Field */}
                                <div className="mb-4">
                                    <label htmlFor="growth" className="block text-sm font-medium text-gray-700">
                                        Growth
                                    </label>
                                    <input
                                        {...register("growth", {
                                            valueAsNumber: true,
                                            required: "Growth plan price is required",
                                        })}
                                        type="number"
                                        id="growth"
                                        placeholder={`Enter Growth Plan Price . Resent Price ${getPlanData?.data?.[0]?.growth ?? 0} `}
                                        className="mt-1 p-2 border border-gray-300 rounded w-full"
                                    />
                                    {errors.growth && (
                                        <p className="text-red-500 text-sm">{errors.growth?.message}</p>
                                    )}
                                </div>

                                {/* Professional Plan Field */}
                                <div className="mb-4">
                                    <label htmlFor="professional" className="block text-sm font-medium text-gray-700">
                                        Professional
                                    </label>
                                    <input
                                        {...register("professional", {
                                            valueAsNumber: true,
                                            required: "Professional plan price is required",
                                        })}
                                        type="number"
                                        id="professional"
                                        placeholder={`Enter Professional Plan Price . Resent Price ${getPlanData?.data?.[0]?.professional ?? 0} `}
                                        className="mt-1 p-2 border border-gray-300 rounded w-full"
                                    />
                                    {errors.professional && (
                                        <p className="text-red-500 text-sm">{errors.professional?.message}</p>
                                    )}
                                </div>

                                <Button type="primary" htmlType="submit" block>
                                    Submit
                                </Button>
                            </form>
                        </div>
                    </div>
                }
                {
                    currentUser.role === "tenant" &&
                    <div className=" bg-white rounded-lg shadow-md h-full">
                        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
                            <div className="absolute -bottom-12 left-6">
                                <div className="h-24 w-24 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                                    <img
                                        src={`${url}${tenantWithOwnerData?.profileImage}`}
                                        alt={tenantWithOwnerData?.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-16 pb-6 px-6">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        {tenantWithOwnerData?.name}
                                    </h2>
                                    <p className="text-sm text-gray-500">Property Owner</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-gray-700">{tenantWithOwnerData?.permanentAddress?.address}</p>
                                            <p className="text-gray-600">
                                                {tenantWithOwnerData?.permanentAddress?.city}, {tenantWithOwnerData?.permanentAddress?.state}
                                            </p>
                                            <p className="text-gray-600">{tenantWithOwnerData?.permanentAddress?.country}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                }
            </div>

            <div className={`${currentUser.role === "tenant" ? "col-span-8" : "col-span-12"} bg-white p-4  md:p-8 rounded-lg shadow-sm`}>
                <div className="flex md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">

                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 flex justify-center items-center ">
                        {
                            profileImage ?
                                <img
                                    src={`${url}${profileImage}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                /> 
                                : <FaRegUser className="size-full p-4" />
                        }
                    </div>
                    <div className="flex-grow ml-2 sm:ml-0 ">
                        <h2 className="text-base sm:text-xl font-semibold">{name || "No Name"}</h2>
                        <p className="text-gray-500">{email || "No Email Provided"}</p>
                    </div>
                    <Link to='edit' className="relative w-fit">
                        <div className="bg-blue-500 h-6 w-6 rounded-full animate-ping">

                        </div>
                        <button className="absolute -top-1.5 -right-1.5 p-2 bg-white rounded-full shadow-lg text-black hover:text-blue-600 active:scale-95 duration-300">
                            <UserPen className="h-5 w-5 " />
                        </button>
                    </Link>
                </div>

                {
                    currentUser.role === "owner" &&

                    // <div className="bg-gray-50 flex justify-between items-center flex-row-reverse mb-8">
                    <div className="md:bg-gray-50 flex flex-col lg:flex-row md:flex-row-reverse justify-between items-center mb-8">
                        <div className="p-4  rounded-md  ">
                            <h2 className="text-lg font-semibold mb-2 text-green-600 ">
                                Summary
                            </h2>
                            <p className="text-gray-700 ">
                                - <strong>Total Units:</strong> <span className="font-bold text-blue-700 text-xl"  >{data?.data?.getTotalUnit || 0}</span>
                            </p>
                            <p className="text-gray-700 ">
                                - <strong>Added Units:</strong> <span className="font-bold text-red-700 text-xl" >{data?.data?.numberOfTotalUnits || 0}</span>
                            </p>
                            <p className="text-gray-700  mb-4">
                                - <strong>Available Units to Add:</strong> <span className="font-bold text-green-700 text-xl" >{data?.data?.getTotalUnit - data?.data?.numberOfTotalUnits || 0}</span>
                            </p>

                            {/* <p className="text-gray-700  mb-4">
                                - <strong>Your Tenant Every Month Last Due Date Is:</strong> <span className="font-bold text-green-700 text-xl" >
                                    {data?.data?.lastDueDateNumber || "Not selected at this stage"} </span> <span className="-ml-1">{ data?.data?.lastDueDateNumber && "th day of the month" }</span>
                            </p> */}
                            <p className="text-gray-700 mb-4">
                                - <strong>Monthly Last Due Date for Tenants:</strong>{" "}
                                <span className="font-bold text-green-700 text-xl">
                                    {data?.data?.lastDueDateNumber || "Not yet specified"}
                                </span>
                                <span className="">
                                    {data?.data?.lastDueDateNumber && " th day of each month"}
                                </span>
                            </p>


                            {/* <div className="mt-4">
                                <p className="text-gray-700">
                                    If you'd like to cancel your current plan, you can do so by clicking the button below.
                                </p>
                                <button
                                    className={`mt-2  text-white px-4 py-2 rounded-md hover:bg-red-700 transition font-semibold ${data?.data?.cancelRequest === true ? "bg-gray-600 hover:bg-gray-600 cursor-not-allowed" : "bg-red-600"} `}
                                    onClick={cancelsubscriptionFun}
                                    disabled={data?.data?.cancelRequest === true}
                                >
                                    {
                                        isCancel ? "Wait A Moment..." : "Cancel Subscription"
                                    }

                                </button>
                            </div> */}

                            <div className="flex flex-col gap-4" >
                                <Button className=" w-[300px]" onClick={() => createTenantPaymentByOwnerHandler(currentUser?.userId)} > {
                                    createTenamtPaymentIsLoading ? "Loading..." : " Set Rent Data For This Month"}  </Button>

                                <Button className="w-[300px]" onClick={() => sendEmailReminderToTenantHandler(currentUser?.userId)} > {
                                    emailReminderIsLoading ? "Loading..." : "Send Rent Payment Reminder Email To Tenants"}  </Button>

                            </div>
                        </div>

                        <div className=" p-6  rounded-lg ">
                            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
                                💰 Your Current Paid Amount
                                <span className="text-[12px] uppercase font-bold text-green-600 mx-2">( Rent )</span>
                            </h2>

                            {data?.data?.paidAmount === undefined || data?.data?.paidAmount === null ? (
                                <h2 className="text-center text-gray-500 font-medium">Amount not available</h2>
                            ) : (
                                <div className="flex flex-col items-center space-y-3">

                                    {/* Paid Amount */}
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg font-medium text-gray-700">Paid:</span>
                                        <span className="text-xl font-bold text-blue-600">{data?.data?.paidAmount}</span>
                                    </div>

                                    {/* Percentage & Deducted Amount */}
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg font-medium text-gray-700">Fee:</span>
                                        <span className="text-md font-semibold text-orange-500">{data?.data?.percentage}%</span>
                                        <span className="text-md text-gray-600">=</span>
                                        <span className="text-md font-bold text-red-500">
                                            -{(data?.data?.paidAmount * (data?.data?.percentage / 100)).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Total Amount After Deduction */}
                                    <div className="flex items-center space-x-2 p-2 px-4 bg-gray-100 rounded-lg shadow-sm">
                                        <span className="text-lg font-semibold text-gray-800">Total After Deduction:</span>
                                        <span className="text-xl font-bold text-green-600">
                                            {(
                                                data?.data?.paidAmount - (data?.data?.paidAmount * (data?.data?.percentage / 100))
                                            ).toFixed(2)}
                                        </span>
                                    </div>

                                </div>
                            )}
                        </div>

                        
                    </div>
                }


                {
                    currentUser.role === "owner" &&
                    <div className="mb-6">
                        <h2 className="text-2xl font-extrabold text-gray-800 mb-4 text-center">Property Overview</h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="flex flex-col items-center bg-zinc-50 p-4 rounded-lg shadow-md">
                                <p className="text-3xl font-bold text-blue-600">{numberOfProperty || 0}</p>
                                <p className="text-gray-500 text-sm">Properties</p>
                            </div>
                            <div className="flex flex-col items-center bg-zinc-50 p-4 rounded-lg shadow-md">
                                <p className="text-3xl font-bold text-indigo-600">{numberOfTotalUnits || 0}</p>
                                <p className="text-gray-500 text-sm">Total Units</p>
                            </div>
                            <div className="flex flex-col items-center bg-zinc-50 p-4 rounded-lg shadow-md">
                                <p className="text-3xl font-bold text-green-600">{totalAmount || 0}</p>
                                <p className="text-gray-500 text-sm">Total Amount</p>
                            </div>
                            <div className="flex flex-col items-center bg-zinc-50 p-4 rounded-lg shadow-md">
                                <p className="text-3xl font-bold text-red-600">{totalRentAmount || 0}</p>
                                <p className="text-gray-500 text-sm">Total Rent</p>
                            </div>
                        </div>
                    </div>
                }


                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                        {personalInfo ? (
                            Object.entries(personalInfo).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex flex-col sm:flex-row sm:justify-between pb-2"
                                >
                                    <span className="text-gray-600 capitalize mb-1 sm:mb-0">
                                        {key.replace(/([A-Z])/g, " $1").trim()}
                                    </span>
                                    <span className="font-medium">{value || "N/A"}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No personal information available.</p>
                        )}
                    </div>



                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-4">Permanent Address</h3>
                        {permanentAddress ? (
                            Object.entries(permanentAddress).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex flex-col sm:flex-row sm:justify-between pb-2"
                                >
                                    <span className="text-gray-600 capitalize mb-1 sm:mb-0">
                                        {key.replace(/([A-Z])/g, " $1").trim()}
                                    </span>
                                    <span className="font-medium">{value || "N/A"}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No permanent address available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
