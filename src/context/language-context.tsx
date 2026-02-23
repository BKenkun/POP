'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

type Language = 'en';

type Translations = {
  [key: string]: string | Translations;
};

const enTranslations: Translations = {
    home: {
      hero_title: "Premium Quality, Unique Sensations",
      hero_subtitle: "Explore our curated selection of poppers and discover a purity and potency that redefines the experience.",
      section_title_new: "New Arrivals",
      section_title_offers: "Special Offers",
      section_title_bestsellers: "Best Sellers",
      feature_secure_title: "100% Secure Website",
      feature_secure_desc: "Your safety is our priority.",
      feature_discreet_payment_title: "Discreet Payment",
      feature_discreet_payment_desc: "No references on your statement.",
      feature_discreet_packaging_title: "Discreet Packaging",
      feature_discreet_packaging_desc: "Packages without marks or logos.",
      feature_fast_shipping_title: "Fast Delivery",
      feature_fast_shipping_desc: "Receive your order in 24/48h.",
      subscribe_title: "Subscribe to our newsletter",
      subscribe_desc: "You can unsubscribe at any time. To do this, please see our contact information in the legal statement.",
      subscribe_placeholder: "Enter your email...",
      subscribe_button: "Subscribe",
      subscribe_button_loading: "Subscribing...",
      subscribe_success: "Thanks for subscribing!",
      subscribe_success_desc: "You will soon receive our best offers.",
      subscribe_error: "Subscription error",
      subscribe_error_desc: "The subscription could not be completed. Please try again.",
      subscribe_error_email: "Please enter your email address.",
    },
    header: {
      free_shipping: 'FREE OVER €40',
      fast_delivery: '24/48h',
      nav_menu: 'Navigation Menu',
      products: 'Products',
      create_pack: 'Create your Pack',
      monthly_dose: 'Monthly Dose',
      product_links: {
        all: "ALL PRODUCTS",
        small: "SMALL POPPERS (10ML)",
        medium: "MEDIUM POPPERS (15ML)",
        large: "LARGE POPPERS (25ML)",
        packs: "POPPER PACKS",
        accessories: "POPPER ACCESSORIES",
        toys: "EROTIC TOYS",
      },
      composition_links: {
        title: "COMPOSITION",
        amyl: "AMYL POPPERS",
        pentyl: "PENTYL POPPERS",
        propyl: "PROPYL POPPERS",
        cbd: "CBD POPPERS",
        mix: "NITRITE MIX",
      }
    },
    cart: {
        title: "Shopping Cart",
        empty_title: "Your cart is empty",
        empty_subtitle: "It seems you haven't added anything yet.",
        subtotal: "Subtotal",
        volume_discount: "Volume discount",
        shipping_estimate: "Shipping (estimated)",
        total_estimate: "Estimated Total:",
        free_shipping_banner: "Enjoy FREE Shipping!",
        free_shipping_threshold: "Free shipping on orders over {price}",
        checkout_button: "Checkout",
        discreet_packaging: "100% discreet packaging.",
        notes: "Volume discount and final shipping costs will be applied at checkout.",
        item_added: "Added to cart",
        item_removed: "Product removed",
        item_unavailable: "Out of stock",
        stock_limit_reached: "Stock limit reached",
    },
    checkout: {
      title: "Complete Order",
      confirm_cart_title: "Confirm Your Cart",
      user_details_title: "Your Details",
      user_details_subtitle: "We need your information to manage the shipment.",
      user_details_not_logged_in: "Please log in or register to continue.",
      login_required_alert_title: "Access Restricted",
      login_required_alert_desc: "You must be logged in to finish the checkout.",
      login_button: "Login",
      register_button: "Register",
      use_new_address: "Use a new address",
      shipping_address_title: "Shipping Address",
      billing_address_title: "Billing Address",
      billing_address_same: "Same as shipping address",
      fullname_label: "Full Name",
      email_label: "Email",
      phone_label: "Phone",
      street_label: "Street Address",
      street_placeholder: "Street name and number",
      city_label: "City",
      state_label: "State / Province",
      zip_label: "Zip Code",
      country_label: "Country",
      save_address_label: "Save this address for future purchases",
      review_title: "Review & Pay",
      order_summary_title: "Order Summary",
      subtotal: "Subtotal",
      shipping: "Shipping",
      free_shipping: "Free",
      total_payable: "Total to Pay",
      products_title: "Products",
      coupon_placeholder: "Enter coupon code",
      apply_button: "Apply",
      applied_button: "Applied",
      confirming_button: "Confirming...",
      processing_button: "Processing...",
      next_button: "Continue",
      previous_button: "Back",
      continue_shopping: "Continue Shopping",
      form_errors: {
        name_required: "Name is required.",
        email_invalid: "Invalid email.",
        phone_required: "Phone is required.",
        street_required: "Street address is required.",
        city_required: "City is required.",
        state_required: "State is required.",
        zip_required: "Zip code is required.",
        country_required: "Country is required.",
      },
      toasts: {
        coupon_applied_title: "Coupon applied!",
        coupon_applied_desc: "You have saved {discount}.",
        coupon_error_title: "Invalid coupon",
        coupon_error_invalid: "The code is not valid.",
        coupon_error_inactive: "The coupon is not active.",
        coupon_error_expired: "The coupon has expired.",
        order_error_title: "Payment Error",
        order_error_desc: "We could not process your order. Please try again.",
        login_required_desc: "You must be logged in to complete the purchase.",
      }
    },
    account: {
        layout_title: "My Account",
        layout_description: "Manage your personal information, orders, and addresses.",
        sidebar_admin_panel: "Admin Panel",
        sidebar_dashboard: "User Dashboard",
        sidebar_orders: "Orders",
        sidebar_addresses: "Addresses",
        sidebar_subscription: "Monthly Dose",
        sidebar_logout: "Logout",
        dashboard_title: "User Dashboard",
        dashboard_welcome: "Welcome back, {name}.",
        dashboard_profile_title: "Profile Information",
        dashboard_profile_subtitle: "Your personal data.",
        dashboard_profile_name: "Name:",
        dashboard_profile_email: "Email:",
        dashboard_loyalty_title: "Loyalty Points",
        dashboard_loyalty_subtitle: "Earn points with every purchase.",
        dashboard_loyalty_points: "Accumulated Points",
        dashboard_loyalty_value: "Your balance is equivalent to a {price} discount.",
        orders_title: "My Orders",
        orders_subtitle: "History of all your purchases.",
        orders_empty_title: "No orders yet",
        orders_empty_subtitle: "Your purchase history will appear here.",
        orders_table_order_no: "Order No.",
        orders_table_date: "Date",
        orders_table_status: "Status",
        orders_table_total: "Total",
        orders_table_actions: "Actions",
        orders_view_details_button: "View Details",
        order_details_title: "Order Details",
        order_details_subtitle: "Order #{orderId}",
        order_details_back_button: "Back to Orders",
        order_details_items_title: "Order Items",
        order_details_summary_title: "Summary",
        order_details_summary_date: "Placed on {date}",
        order_details_summary_status: "Order status:",
        order_details_summary_subtotal: "Subtotal:",
        order_details_summary_total: "TOTAL:",
        order_details_shipping_address_title: "Shipping Address",
        order_details_not_found_title: "Order not found",
        order_details_not_found_subtitle: "We couldn't find this order.",
        addresses_title: "My Addresses",
        addresses_subtitle: "Manage your shipping and billing addresses.",
        addresses_add_button: "Add Address",
        addresses_edit_button: "Edit",
        addresses_delete_button: "Delete",
        addresses_default_badge: "Default",
        addresses_dialog_edit_title: "Edit Address",
        addresses_dialog_add_title: "Add New Address",
        addresses_dialog_alias_label: "Address Alias (e.g. Home, Work)",
        addresses_dialog_name_label: "Full Name (Recipient)",
        addresses_dialog_phone_label: "Phone",
        addresses_dialog_street_label: "Street and number",
        addresses_dialog_city_label: "City",
        addresses_dialog_state_label: "State / Province",
        addresses_dialog_zip_label: "Zip Code",
        addresses_dialog_country_label: "Country",
        addresses_dialog_default_label: "Set as default address",
        addresses_dialog_cancel_button: "Cancel",
        addresses_dialog_save_button: "Save",
        addresses_toast_save_success_title: "Address saved",
        addresses_toast_save_success_desc: "Your address list has been updated.",
        addresses_toast_save_error_title: "Error",
        addresses_toast_save_error_desc: "Could not save address.",
        addresses_toast_delete_success_title: "Address deleted",
        addresses_toast_delete_success_desc: "The address has been deleted.",
        addresses_toast_delete_error_desc: "Could not delete address.",
        addresses_delete_confirm_title: "Are you sure?",
        addresses_delete_confirm_desc: "This action cannot be undone.",
        addresses_delete_confirm_continue: "Continue",
        addresses_empty_placeholder: "No saved addresses yet.",
        menu: {
          admin_title: "Admin Account",
          user_title: "My Account",
          admin_panel: "Admin Panel",
          user_dashboard: "User Dashboard",
          orders: "Orders",
          addresses: "Addresses",
          logout: "Logout"
        },
        invalid_date: "Invalid date",
        date_unavailable: "Date unavailable",
        subscription: {
          title: "Customize your Monthly Dose",
          subtitle_open: "Choose your favorite products for this month's box.",
          selected_badge: "Selected",
          not_chosen_yet: "Not chosen yet",
          change_selection_button: "Change Selection",
          choose_product_button: "Choose Product",
          select_dialog_title: "Select your {type}",
          popper: "Popper",
          accessory: "Accessory",
          select_button: "Select",
          save_success_title: "Selection Saved",
          save_success_desc: "Preferences saved.",
          save_error_desc: "Could not save selection.",
          box_on_its_way_title: "Your box is on its way!",
          box_on_its_way_desc: "We are preparing your order.",
          confirm_selection_button: "Confirm my selection",
          timeline_step1: "Cycle Start",
          timeline_step2: "Selection Open",
          timeline_step3: "Shipment",
          failed_title: "Payment Failed",
          retry_button: "Retry",
          success_title: "Subscription Confirmed!",
          customize_box_button: "Customize my Box"
        }
    },
    popups: {
      age_verification_title: 'Age Verification',
      age_verification_subtitle: 'Enter your date of birth to continue.',
      age_verification_exit_button: 'Exit',
      age_verification_enter_button: 'Enter',
      age_verification_error_invalid: 'Please enter a valid date.',
      age_verification_error_underage: 'You must be over {min_age} years old to enter.',
      welcome_title: 'Welcome!',
      welcome_subtitle_part1: 'Subscribe to our newsletter and get a',
      welcome_subtitle_discount: '10% discount',
      welcome_subtitle_part2: 'on your first purchase.',
      welcome_open_offer_aria: 'Open subscription offer',
      cookies_banner_text: 'We use cookies to improve your experience.',
      cookies_customize: 'Customize',
      cookies_reject: 'Reject',
      cookies_accept: 'Accept All',
      cookies_preferences_title: 'Cookie Preferences',
      cookies_preferences_desc: 'Manage which cookies you allow on our site.',
      cookies_technical: 'Technical (Always active)',
      cookies_analytics: 'Analytics',
      cookies_marketing: 'Marketing',
      cookies_save: 'Save Preferences',
    },
    notifications: {
      recent_purchase_title: 'Recent Purchase!',
      recent_purchase_desc: '{name} from {location} just bought {quantity} x {product_name}.',
      real_order_title: 'Real Order Confirmed!',
      a_city: 'a city'
    },
    footer: {
      slogan: 'Your trusted shop for premium quality aromas.',
      column_info: 'Information',
      column_guides: 'Guides',
      column_legal: 'Legal',
      column_help: 'Help',
      link_legal_info: 'Legal information',
      link_terms: 'Terms and Conditions',
      link_popper_sale: 'Popper Sale',
      link_secure_payments: 'Secure payments',
      link_popper_info: 'Popper Info',
      link_leather_cleaners: 'Leather Cleaners',
      link_popper_shop: 'Popper Shop',
      link_privacy: 'Privacy',
      link_disputes: 'Dispute resolution',
      link_cookies: 'Cookie policy',
      link_shipping: 'Shipping',
      link_contact: 'Contact us',
      link_blog: 'Blog',
      link_docs: 'Site Docs',
      copyright: 'All rights reserved.'
    }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getNestedTranslation = (obj: Translations, key: string): string | Translations | undefined => {
  return key.split('.').reduce<string | Translations | undefined>((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return (acc as Translations)[part];
    }
    return undefined;
  }, obj);
}

const translations: Record<Language, Translations> = {
  en: enTranslations,
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const setLanguageCallback = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  const t = useCallback((key: string, replacements: Record<string, string | number> = {}): string => {
    const selectedLanguageTranslations = translations[language] || translations.en;
    
    let translation = getNestedTranslation(selectedLanguageTranslations, key);

    if (typeof translation !== 'string') {
        return key;
    }

    let strResult = translation;
    for (const placeholder in replacements) {
        strResult = strResult.replace(`{${placeholder}}`, String(replacements[placeholder]));
    }
    return strResult;

  }, [language]);


  const value = useMemo(() => ({
    language,
    setLanguage: setLanguageCallback,
    t,
  }), [language, setLanguageCallback, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = useLanguage;
