'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

type Language = 'en';

type Translations = {
  [key: string]: string | Translations;
};

const enTranslations: Translations = {
    home: {
      hero_title: "Premium Quality, Unique Sensations",
      hero_subtitle: "Explore our curated selection of aromas and discover a purity and potency that redefines the experience.",
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
      subscribe_desc: "Get exclusive offers and news directly in your inbox.",
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
        small: "SMALL (10ML)",
        medium: "MEDIUM (15ML)",
        large: "LARGE (25ML)",
        packs: "PACKS",
        accessories: "ACCESSORIES",
        toys: "EROTIC TOYS",
      },
      composition_links: {
        title: "COMPOSITION",
        amyl: "AMYL",
        pentyl: "PENTYL",
        propyl: "PROPYL",
        cbd: "CBD",
        mix: "NITRITE MIX",
      }
    },
    cart: {
        title: "Shopping Cart",
        empty_title: "Your cart is empty",
        empty_subtitle: "It seems you haven't added anything yet.",
        subtotal: "Subtotal",
        volume_discount: "Volume discount",
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
      user_details_subtitle: "Information for delivery management.",
      user_details_not_logged_in: "Please log in or register to continue.",
      login_required_alert_title: "Access Restricted",
      login_required_alert_desc: "You must be logged in to finish the checkout.",
      login_button: "Login",
      register_button: "Register",
      use_new_address: "Use a new address",
      shipping_address_title: "Shipping Address",
      fullname_label: "Full Name",
      email_label: "Email",
      phone_label: "Phone",
      street_label: "Street Address",
      street_placeholder: "Street name and number",
      city_label: "City",
      state_label: "State / Province",
      zip_label: "Zip Code",
      country_label: "Country",
      save_address_label: "Save this address",
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
        street_required: "Street is required.",
        city_required: "City is required.",
        state_required: "State is required.",
        zip_required: "Zip code is required.",
        country_required: "Country is required.",
      },
      toasts: {
        coupon_applied_title: "Coupon applied!",
        coupon_applied_desc: "You have saved {discount}.",
        coupon_error_title: "Invalid coupon",
        coupon_error_invalid: "Code is not valid.",
        coupon_error_inactive: "Coupon is not active.",
        coupon_error_expired: "Coupon has expired.",
        order_error_title: "Payment Error",
        order_error_desc: "Could not process order. Please try again.",
        login_required_desc: "Login required to complete purchase.",
      }
    },
    account: {
        layout_title: "My Account",
        layout_description: "Manage your profile, orders, and addresses.",
        sidebar_admin_panel: "Admin Panel",
        sidebar_dashboard: "Dashboard",
        sidebar_orders: "Orders",
        sidebar_addresses: "Addresses",
        sidebar_subscription: "Monthly Dose",
        sidebar_logout: "Logout",
        dashboard_title: "Account Dashboard",
        dashboard_welcome: "Welcome back, {name}.",
        dashboard_profile_title: "Profile Info",
        dashboard_profile_subtitle: "Your account details.",
        dashboard_profile_name: "Name:",
        dashboard_profile_email: "Email:",
        dashboard_loyalty_title: "Loyalty Points",
        dashboard_loyalty_subtitle: "Earn rewards with every purchase.",
        dashboard_loyalty_points: "Points Balance",
        dashboard_loyalty_value: "Equivalent to {price} discount.",
        orders_title: "Order History",
        orders_subtitle: "Track and manage your orders.",
        orders_empty_title: "No orders yet",
        orders_empty_subtitle: "Your orders will appear here.",
        orders_table_order_no: "Order #",
        orders_table_date: "Date",
        orders_table_status: "Status",
        orders_table_total: "Total",
        orders_table_actions: "Actions",
        orders_view_details_button: "View",
        order_details_title: "Order Details",
        order_details_subtitle: "Order #{orderId}",
        order_details_back_button: "Back to Orders",
        order_details_items_title: "Items",
        order_details_summary_title: "Summary",
        order_details_summary_date: "Placed on {date}",
        order_details_summary_status: "Status:",
        order_details_summary_subtotal: "Subtotal:",
        order_details_summary_total: "TOTAL:",
        order_details_shipping_address_title: "Shipping Address",
        addresses_title: "My Addresses",
        addresses_subtitle: "Manage your saved addresses.",
        addresses_add_button: "Add Address",
        addresses_edit_button: "Edit",
        addresses_delete_button: "Delete",
        addresses_default_badge: "Default",
        addresses_empty_placeholder: "No addresses saved.",
        menu: {
          admin_title: "Admin",
          user_title: "User",
          admin_panel: "Admin Panel",
          user_dashboard: "Dashboard",
          orders: "Orders",
          addresses: "Addresses",
          logout: "Logout"
        },
        subscription: {
          title: "Your Monthly Dose",
          selected_badge: "Selected",
          not_chosen_yet: "Not chosen",
          popper: "Aroma",
          accessory: "Accessory",
          box_on_its_way_title: "Box on its way!",
          confirm_selection_button: "Confirm Selection",
          timeline_step1: "Start",
          timeline_step2: "Selection",
          timeline_step3: "Shipping",
          success_title: "Welcome to the Club!",
          customize_box_button: "Customize My Box"
        }
    },
    popups: {
      age_verification_title: 'Age Verification',
      age_verification_subtitle: 'Please confirm you are over 18 years old.',
      age_verification_exit_button: 'Exit',
      age_verification_enter_button: 'Enter',
      age_verification_error_invalid: 'Invalid date.',
      age_verification_error_underage: 'You must be 18+ to enter.',
      welcome_title: 'Welcome!',
      welcome_subtitle_part1: 'Subscribe and get a',
      welcome_subtitle_discount: '10% discount',
      welcome_subtitle_part2: 'on your first order.',
      cookies_banner_text: 'We use cookies to improve your experience.',
      cookies_customize: 'Settings',
      cookies_reject: 'Reject',
      cookies_accept: 'Accept All',
      cookies_save: 'Save Preferences',
    },
    notifications: {
      recent_purchase_title: 'Recent Purchase!',
      recent_purchase_desc: '{name} from {location} bought {quantity} x {product_name}.',
      real_order_title: 'Order Confirmed!',
      a_city: 'a city'
    },
    footer: {
      slogan: 'Premium quality aromas.',
      column_info: 'Information',
      column_guides: 'Guides',
      column_legal: 'Legal',
      column_help: 'Help',
      link_legal_info: 'Legal info',
      link_terms: 'Terms',
      link_popper_sale: 'Aroma sale',
      link_secure_payments: 'Payments',
      link_popper_info: 'Info',
      link_leather_cleaners: 'Cleaners',
      link_popper_shop: 'Shop',
      link_privacy: 'Privacy',
      link_disputes: 'Disputes',
      link_cookies: 'Cookies',
      link_shipping: 'Shipping',
      link_contact: 'Contact',
      link_blog: 'Blog',
      link_docs: 'Docs',
      copyright: 'All rights reserved.'
    },
    products: {
      title: "Our Collection",
      subtitle: "The finest selection of premium aromas.",
    },
    product_card: {
      add_to_cart: "Add to Cart",
      sold_out: "Sold Out",
      offer: "Sale",
      notify_me: "Notify Me"
    },
    product_details: {
      description_tab: "Description",
      details_tab: "Details"
    },
    product_info: {
      secure_payment: "Secure Payment",
      fast_shipping: "Fast Shipping",
      discreet_packaging: "Discreet Packaging"
    },
    related_products: {
      title: "You may also like"
    },
    filters: {
      title: "Filters",
      clear: "Clear",
      search: "Search",
      search_placeholder: "Search products...",
      sort_by: "Sort By",
      sort_placeholder: "Select sorting",
      categories: "Categories",
      brands: "Brands",
      size: "Size",
      composition: "Composition",
      sort_options: {
        name_asc: "Name: A-Z",
        name_desc: "Name: Z-A",
        price_asc: "Price: Low to High",
        price_desc: "Price: High to Low"
      },
      category_options: {
        novedad: "New Arrivals",
        oferta: "On Sale",
        'mas-vendido': "Best Sellers",
        pack: "Packs",
        accesorio: "Accessories",
        juguete: "Toys"
      }
    },
    pack_builder: {
      page_title: "Custom Pack Builder",
      page_subtitle: "Mix and match to save more.",
      step1_title: "1. Select Products",
      step2_title: "2. Your Selection",
      summary_title: "Pack Summary",
      add_button: "Add to Pack",
      buy_now_button: "Checkout Pack",
      products_in_pack: "Products in pack",
      total_units: "Total units",
      calculating_discount: "Calculating discount...",
      original_price: "Standard Price",
      your_savings: "Your Savings",
      pack_total: "Pack Total",
      unlock_discount_message: "Add more items to unlock volume discounts.",
      empty_pack_message: "Start adding products to your pack.",
      redirect_title: "Redirecting...",
      redirect_desc: "Going to secure payment.",
      product_limit_desc: "Max {max} units per product in a pack.",
      pack_limit_desc: "Pack limit is {max} items."
    },
    auth: {
      login_title: "Login",
      login_subtitle: "Access your account.",
      email_label: "Email",
      password_label: "Password",
      forgot_password_link: "Forgot password?",
      login_button: "Login",
      logging_in_button: "Logging in...",
      no_account_prompt: "Don't have an account?",
      register_link: "Register here",
      register_title: "Register",
      register_subtitle: "Join us today.",
      confirm_password_label: "Confirm Password",
      register_button: "Register",
      registering_button: "Registering...",
      have_account_prompt: "Already have an account?",
      login_link: "Login here",
      register_success_title: "Check your email!",
      register_success_subtitle: "Welcome, {name}.",
      register_success_description: "We've sent a verification link to your email.",
      go_to_account_button: "Go to My Account",
      continue_shopping_button: "Continue Shopping",
      forgot_password_title: "Reset Password",
      forgot_password_subtitle: "We will send you a recovery link.",
      forgot_password_success_subtitle: "Check your inbox.",
      send_recovery_link_button: "Send Link",
      back_to_login_button: "Back to Login",
      sending_button: "Sending...",
      password_strength_8_chars: "At least 8 characters",
      password_strength_uppercase: "One uppercase letter",
      password_strength_lowercase: "One lowercase letter",
      password_strength_number: "One number",
      password_strength_special: "One special character"
    },
    stock_notification: {
      dialog_title: "Back in Stock Notification",
      dialog_description: "Enter your email to be notified when {product_name} is available again.",
      email_label: "Email",
      cancel_button: "Cancel",
      submit_button: "Notify Me",
      sending_button: "Registering...",
      success_title: "Notification Registered",
      success_description: "We will email {email} when {product_name} is back.",
      error_title: "Error",
      error_missing_info: "Product info or email missing.",
      error_generic: "Could not register request.",
      error_unexpected: "An unexpected error occurred."
    },
    contact_page: {
      title: "Contact Us",
      subtitle: "How can we help you?",
      email_card_title: "Email Support",
      email_card_description: "Expect a response within 24h.",
      legal_card_title: "Business Info",
      form_card_title: "Send a Message",
      form_name: "Name",
      form_email: "Email",
      form_subject: "Subject",
      form_message: "Message",
      form_submit_button: "Send Message",
      form_sending_button: "Sending...",
      success_toast_title: "Message Sent",
      success_toast_description: "We will contact you soon."
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
    // Strict English only
    setLanguage('en');
  }, []);

  const t = useCallback((key: string, replacements: Record<string, string | number> = {}): string => {
    const selectedLanguageTranslations = translations.en;
    
    let translation = getNestedTranslation(selectedLanguageTranslations, key);

    if (typeof translation !== 'string') {
        return key;
    }

    let strResult = translation;
    for (const placeholder in replacements) {
        strResult = strResult.replace(`{${placeholder}}`, String(replacements[placeholder]));
    }
    return strResult;

  }, []);


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
