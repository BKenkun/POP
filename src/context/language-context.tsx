
'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

type Language = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt';

// Define a nested structure for translations
type Translations = {
  [key: string]: string | Translations;
};

// Simplified dictionary for now
const translations: Record<Language, Translations> = {
  es: {
    header: {
      free_shipping: 'GRATIS +40€',
      fast_delivery: '24/48h',
      nav_menu: 'Menú de Navegación',
      products: 'Productos',
      create_pack: 'Crea tu Pack',
      monthly_dose: 'Dosis Mensual'
    },
    cart: {
        title: "Carrito de la Compra",
        empty_title: "Tu carrito está vacío",
        empty_subtitle: "Parece que aún no has añadido nada.",
        subtotal: "Subtotal",
        volume_discount: "Descuento por volumen (con pago anticipado)",
        shipping_estimate: "Envío (estimado)",
        total_estimate: "Total Estimado:",
        free_shipping_banner: "¡Disfrutas de Envío GRATIS!",
        free_shipping_threshold: "Envío gratis en pedidos superiores a {price}",
        checkout_button: "Finalizar Reserva",
        discreet_packaging: "Embalaje 100% discreto.",
        notes: "El descuento por volumen y los gastos de envío finales se aplicarán en la pantalla de pago según el método elegido.",
        item_added: "Añadido al carrito",
        item_removed: "Producto eliminado",
        item_unavailable: "Agotado",
        stock_limit_reached: "Límite de stock alcanzado",
    },
    account: {
        layout_title: "Mi Cuenta",
        layout_description: "Gestiona tu información personal, pedidos y direcciones.",
        sidebar_admin_panel: "Panel de Admin",
        sidebar_dashboard: "Panel de Usuario",
        sidebar_orders: "Pedidos",
        sidebar_addresses: "Direcciones",
        sidebar_subscription: "Dosis Mensual",
        sidebar_logout: "Cerrar Sesión",
        dashboard_title: "Panel de Usuario",
        dashboard_welcome: "Bienvenido de nuevo, {name}.",
        dashboard_profile_title: "Información de Perfil",
        dashboard_profile_subtitle: "Tus datos personales.",
        dashboard_profile_name: "Nombre:",
        dashboard_profile_email: "Email:",
        dashboard_loyalty_title: "Puntos de Fidelidad",
        dashboard_loyalty_subtitle: "Gana puntos con cada compra.",
        dashboard_loyalty_points: "Puntos Acumulados",
        dashboard_loyalty_value: "Tu saldo equivale a un descuento de {price}.",
    },
    products: {
        title: "Nuestro Catálogo",
        subtitle: "Encuentra tu aroma perfecto. Usa los filtros para descubrir nuestra selección."
    },
    filters: {
        title: "Filtros",
        clear: "Limpiar",
        search: "Búsqueda",
        search_placeholder: "Buscar productos...",
        sort_by: "Ordenar por",
        sort_placeholder: "Seleccionar orden",
        sort_options: {
            name_asc: "Nombre (A-Z)",
            name_desc: "Nombre (Z-A)",
            price_asc: "Precio (Menor a Mayor)",
            price_desc: "Precio (Mayor a Menor)"
        },
        categories: "Categorías",
        category_options: {
            novedad: "Novedades",
            oferta: "Ofertas",
            "mas-vendido": "Más Vendidos",
            pack: "Packs",
            accesorio: "Accesorios"
        },
        brands: "Marcas",
        size: "Tamaño",
        composition: "Composición"
    },
    product_card: {
        sold_out: "Agotado",
        offer: "OFERTA",
        notify_me: "Avísame",
        add_to_cart: "Añadir"
    },
    product_info: {
        secure_payment: "Compra segura y pago discreto garantizado.",
        fast_shipping: "Envío rápido en 24/48h a toda la península.",
        discreet_packaging: "Embalaje 100% discreto sin marcas externas."
    },
    product_details: {
        description_tab: "Descripción",
        details_tab: "Detalles del producto"
    },
    related_products: {
        title: "Productos Relacionados"
    },
    stock_notification: {
        dialog_title: "Notificación de Stock",
        dialog_description: "Recibirás un único correo cuando {product_name} vuelva a estar disponible.",
        error_title: "Error",
        error_missing_info: "Falta información del producto o el email. Inténtalo de nuevo.",
        error_generic: "No se pudo procesar tu solicitud.",
        error_unexpected: "Ocurrió un error inesperado.",
        success_title: "¡Te avisaremos!",
        success_description: "Recibirás un correo en {email} en cuanto {product_name} vuelva a estar disponible.",
        cancel_button: "Cancelar",
        submit_button: "Solicitar Notificación",
        sending_button: "Enviando..."
    }
  },
  en: {
    header: {
      free_shipping: 'FREE +€40',
      fast_delivery: '24/48h',
      nav_menu: 'Navigation Menu',
      products: 'Products',
      create_pack: 'Create your Pack',
      monthly_dose: 'Monthly Dose'
    },
    cart: {
        title: "Shopping Cart",
        empty_title: "Your cart is empty",
        empty_subtitle: "Looks like you haven't added anything yet.",
        subtotal: "Subtotal",
        volume_discount: "Volume discount (with prepayment)",
        shipping_estimate: "Shipping (estimated)",
        total_estimate: "Estimated Total:",
        free_shipping_banner: "You have FREE shipping!",
        free_shipping_threshold: "Free shipping on orders over {price}",
        checkout_button: "Finalize Reservation",
        discreet_packaging: "100% discreet packaging.",
        notes: "Volume discount and final shipping costs will be applied on the checkout screen based on the chosen method.",
        item_added: "Added to cart",
        item_removed: "Product removed",
        item_unavailable: "Sold out",
        stock_limit_reached: "Stock limit reached",
    },
     account: {
        layout_title: "My Account",
        layout_description: "Manage your personal information, orders, and addresses.",
        sidebar_admin_panel: "Admin Panel",
        sidebar_dashboard: "User Dashboard",
        sidebar_orders: "Orders",
        sidebar_addresses: "Addresses",
        sidebar_subscription: "Monthly Dose",
        sidebar_logout: "Log Out",
        dashboard_title: "User Dashboard",
        dashboard_welcome: "Welcome back, {name}.",
        dashboard_profile_title: "Profile Information",
        dashboard_profile_subtitle: "Your personal data.",
        dashboard_profile_name: "Name:",
        dashboard_profile_email: "Email:",
        dashboard_loyalty_title: "Loyalty Points",
        dashboard_loyalty_subtitle: "Earn points with every purchase.",
        dashboard_loyalty_points: "Accumulated Points",
        dashboard_loyalty_value: "Your balance is equivalent to a discount of {price}.",
    },
    products: {
        title: "Our Catalog",
        subtitle: "Find your perfect scent. Use the filters to discover our selection."
    },
    filters: {
        title: "Filters",
        clear: "Clear",
        search: "Search",
        search_placeholder: "Search products...",
        sort_by: "Sort by",
        sort_placeholder: "Select order",
        sort_options: {
            name_asc: "Name (A-Z)",
            name_desc: "Name (Z-A)",
            price_asc: "Price (Low to High)",
            price_desc: "Price (High to Low)"
        },
        categories: "Categories",
        category_options: {
            novedad: "New Arrivals",
            oferta: "Offers",
            "mas-vendido": "Best Sellers",
            pack: "Packs",
            accesorio: "Accessories"
        },
        brands: "Brands",
        size: "Size",
        composition: "Composition"
    },
    product_card: {
        sold_out: "Sold Out",
        offer: "OFFER",
        notify_me: "Notify Me",
        add_to_cart: "Add"
    },
    product_info: {
        secure_payment: "Secure purchase and guaranteed discreet payment.",
        fast_shipping: "Fast shipping in 24/48h to the entire peninsula.",
        discreet_packaging: "100% discreet packaging with no external markings."
    },
    product_details: {
        description_tab: "Description",
        details_tab: "Product Details"
    },
    related_products: {
        title: "Related Products"
    },
    stock_notification: {
        dialog_title: "Stock Notification",
        dialog_description: "You will receive a single email when {product_name} is back in stock.",
        error_title: "Error",
        error_missing_info: "Missing product information or email. Please try again.",
        error_generic: "Could not process your request.",
        error_unexpected: "An unexpected error occurred.",
        success_title: "We'll notify you!",
        success_description: "You will receive an email at {email} as soon as {product_name} is available again.",
        cancel_button: "Cancel",
        submit_button: "Request Notification",
        sending_button: "Sending..."
    }
  },
  fr: {
    header: {
      free_shipping: 'GRATUIT +40€',
      fast_delivery: '24/48h',
      nav_menu: 'Menu de Navigation',
      products: 'Produits',
      create_pack: 'Créez votre Pack',
      monthly_dose: 'Dose Mensuelle'
    },
    cart: {
        title: "Panier d'achat",
        empty_title: "Votre panier est vide",
        empty_subtitle: "Il semble que vous n'ayez encore rien ajouté.",
        subtotal: "Sous-total",
        volume_discount: "Remise sur volume (avec prépaiement)",
        shipping_estimate: "Livraison (estimée)",
        total_estimate: "Total Estimé:",
        free_shipping_banner: "Vous bénéficiez de la livraison GRATUITE!",
        free_shipping_threshold: "Livraison gratuite pour les commandes de plus de {price}",
        checkout_button: "Finaliser la réservation",
        discreet_packaging: "Emballage 100% discret.",
        notes: "La remise sur le volume et les frais de port finaux seront appliqués sur l'écran de paiement en fonction de la méthode choisie.",
        item_added: "Ajouté au panier",
        item_removed: "Produit supprimé",
        item_unavailable: "Épuisé",
        stock_limit_reached: "Limite de stock atteinte",
    },
     account: {
        layout_title: "Mon Compte",
        layout_description: "Gérez vos informations personnelles, commandes et adresses.",
        sidebar_admin_panel: "Panel d'administration",
        sidebar_dashboard: "Tableau de bord",
        sidebar_orders: "Commandes",
        sidebar_addresses: "Adresses",
        sidebar_subscription: "Dose Mensuelle",
        sidebar_logout: "Se déconnecter",
        dashboard_title: "Tableau de bord",
        dashboard_welcome: "Content de vous revoir, {name}.",
        dashboard_profile_title: "Informations sur le profil",
        dashboard_profile_subtitle: "Vos données personnelles.",
        dashboard_profile_name: "Nom:",
        dashboard_profile_email: "Email:",
        dashboard_loyalty_title: "Points de fidélité",
        dashboard_loyalty_subtitle: "Gagnez des points à chaque achat.",
        dashboard_loyalty_points: "Points accumulés",
        dashboard_loyalty_value: "Votre solde équivaut à une remise de {price}.",
    },
    products: {
        title: "Notre Catalogue",
        subtitle: "Trouvez votre parfum parfait. Utilisez les filtres pour découvrir notre sélection."
    },
    filters: {
        title: "Filtres",
        clear: "Effacer",
        search: "Recherche",
        search_placeholder: "Rechercher des produits...",
        sort_by: "Trier par",
        sort_placeholder: "Sélectionner l'ordre",
        sort_options: {
            name_asc: "Nom (A-Z)",
            name_desc: "Nom (Z-A)",
            price_asc: "Prix (Croissant)",
            price_desc: "Prix (Décroissant)"
        },
        categories: "Catégories",
        category_options: {
            novedad: "Nouveautés",
            oferta: "Offres",
            "mas-vendido": "Meilleures ventes",
            pack: "Packs",
            accesorio: "Accessoires"
        },
        brands: "Marques",
        size: "Taille",
        composition: "Composition"
    },
    product_card: {
        sold_out: "Épuisé",
        offer: "OFFRE",
        notify_me: "Prévenez-moi",
        add_to_cart: "Ajouter"
    },
    product_info: {
        secure_payment: "Achat sécurisé et paiement discret garanti.",
        fast_shipping: "Livraison rapide en 24/48h dans toute la péninsule.",
        discreet_packaging: "Emballage 100% discret sans marques extérieures."
    },
    product_details: {
        description_tab: "Description",
        details_tab: "Détails du produit"
    },
    related_products: {
        title: "Produits Connexes"
    },
    stock_notification: {
        dialog_title: "Notification de Stock",
        dialog_description: "Vous recevrez un único e-mail lorsque {product_name} sera de nouveau disponible.",
        error_title: "Erreur",
        error_missing_info: "Informations sur le produit ou e-mail manquantes. Veuillez réessayer.",
        error_generic: "Impossible de traiter votre demande.",
        error_unexpected: "Une erreur inattendue s'est produite.",
        success_title: "Nous vous préviendrons!",
        success_description: "Vous recevrez un e-mail à {email} dès que {product_name} sera de nouveau disponible.",
        cancel_button: "Annuler",
        submit_button: "Demander une notification",
        sending_button: "Envoi en cours..."
    }
  },
  de: {
    header: {
      free_shipping: 'GRATIS +40€',
      fast_delivery: '24/48h',
      nav_menu: 'Navigationsmenü',
      products: 'Produkte',
      create_pack: 'Ihr Paket erstellen',
      monthly_dose: 'Monatsdosis'
    },
    cart: {
        title: "Warenkorb",
        empty_title: "Ihr Warenkorb ist leer",
        empty_subtitle: "Sieht aus, als hättest du noch nichts hinzugefügt.",
        subtotal: "Zwischensumme",
        volume_discount: "Mengenrabatt (bei Vorauszahlung)",
        shipping_estimate: "Versand (geschätzt)",
        total_estimate: "Geschätzte Summe:",
        free_shipping_banner: "Sie haben KOSTENLOSEN Versand!",
        free_shipping_threshold: "Kostenloser Versand bei Bestellungen über {price}",
        checkout_button: "Reservierung abschließen",
        discreet_packaging: "100% diskrete Verpackung.",
        notes: "Mengenrabatt und endgültige Versandkosten werden auf dem Checkout-Bildschirm basierend auf der gewählten Methode angewendet.",
        item_added: "Zum Warenkorb hinzugefügt",
        item_removed: "Produkt entfernt",
        item_unavailable: "Ausverkauft",
        stock_limit_reached: "Bestandslimit erreicht",
    },
     account: {
        layout_title: "Mein Konto",
        layout_description: "Verwalten Sie Ihre persönlichen Informationen, Bestellungen und Adressen.",
        sidebar_admin_panel: "Admin-Panel",
        sidebar_dashboard: "Benutzer-Dashboard",
        sidebar_orders: "Bestellungen",
        sidebar_addresses: "Adressen",
        sidebar_subscription: "Monatliche Dosis",
        sidebar_logout: "Ausloggen",
        dashboard_title: "Benutzer-Dashboard",
        dashboard_welcome: "Willkommen zurück, {name}.",
        dashboard_profile_title: "Profilinformationen",
        dashboard_profile_subtitle: "Ihre persönlichen Daten.",
        dashboard_profile_name: "Name:",
        dashboard_profile_email: "Email:",
        dashboard_loyalty_title: "Treuepunkte",
        dashboard_loyalty_subtitle: "Sammeln Sie bei jedem Einkauf Punkte.",
        dashboard_loyalty_points: "Gesammelte Punkte",
        dashboard_loyalty_value: "Ihr Guthaben entspricht einem Rabatt von {price}.",
    },
    products: {
        title: "Unser Katalog",
        subtitle: "Finden Sie Ihren perfekten Duft. Nutzen Sie die Filter, um unsere Auswahl zu entdecken."
    },
    filters: {
        title: "Filter",
        clear: "Löschen",
        search: "Suchen",
        search_placeholder: "Produkte suchen...",
        sort_by: "Sortieren nach",
        sort_placeholder: "Reihenfolge auswählen",
        sort_options: {
            name_asc: "Name (A-Z)",
            name_desc: "Name (Z-A)",
            price_asc: "Preis (Aufsteigend)",
            price_desc: "Preis (Absteigend)"
        },
        categories: "Kategorien",
        category_options: {
            novedad: "Neuheiten",
            oferta: "Angebote",
            "mas-vendido": "Bestseller",
            pack: "Pakete",
            accesorio: "Zubehör"
        },
        brands: "Marken",
        size: "Größe",
        composition: "Zusammensetzung"
    },
    product_card: {
        sold_out: "Ausverkauft",
        offer: "ANGEBOT",
        notify_me: "Benachrichtigen",
        add_to_cart: "Hinzufügen"
    },
    product_info: {
        secure_payment: "Sicherer Kauf und garantierte diskrete Zahlung.",
        fast_shipping: "Schneller Versand in 24/48h auf die gesamte Halbinsel.",
        discreet_packaging: "100% diskrete Verpackung ohne äußere Kennzeichnungen."
    },
    product_details: {
        description_tab: "Beschreibung",
        details_tab: "Produktdetails"
    },
    related_products: {
        title: "Ähnliche Produkte"
    },
    stock_notification: {
        dialog_title: "Bestandsbenachrichtigung",
        dialog_description: "Sie erhalten eine einzige E-Mail, wenn {product_name} wieder auf Lager ist.",
        error_title: "Fehler",
        error_missing_info: "Fehlende Produktinformationen oder E-Mail. Bitte versuchen Sie es erneut.",
        error_generic: "Ihre Anfrage konnte nicht bearbeitet werden.",
        error_unexpected: "Ein unerwarteter Fehler ist aufgetreten.",
        success_title: "Wir benachrichtigen Sie!",
        success_description: "Sie erhalten eine E-Mail an {email}, sobald {product_name} wieder verfügbar ist.",
        cancel_button: "Abbrechen",
        submit_button: "Benachrichtigung anfordern",
        sending_button: "Senden..."
    }
  },
  it: {
    header: {
      free_shipping: 'GRATIS +40€',
      fast_delivery: '24/48h',
      nav_menu: 'Menu di Navigazione',
      products: 'Prodotti',
      create_pack: 'Crea il tuo Pack',
      monthly_dose: 'Dose Mensile'
    },
    cart: {
        title: "Carrello",
        empty_title: "Il tuo carrello è vuoto",
        empty_subtitle: "Sembra che tu non abbia ancora aggiunto nulla.",
        subtotal: "Subtotale",
        volume_discount: "Sconto volume (con pagamento anticipato)",
        shipping_estimate: "Spedizione (stimata)",
        total_estimate: "Totale Stimato:",
        free_shipping_banner: "Hai la spedizione GRATUITA!",
        free_shipping_threshold: "Spedizione gratuita per ordini superiori a {price}",
        checkout_button: "Finalizza Prenotazione",
        discreet_packaging: "Imballaggio 100% discreto.",
        notes: "Lo sconto sul volume e le spese di spedizione finali verranno applicati nella schermata di pagamento in base al metodo scelto.",
        item_added: "Aggiunto al carrello",
        item_removed: "Prodotto rimosso",
        item_unavailable: "Esaurito",
        stock_limit_reached: "Limite di magazzino raggiunto",
    },
     account: {
        layout_title: "Il mio account",
        layout_description: "Gestisci le tue informazioni personali, ordini e indirizzi.",
        sidebar_admin_panel: "Pannello di amministrazione",
        sidebar_dashboard: "Cruscotto utente",
        sidebar_orders: "Ordini",
        sidebar_addresses: "Indirizzi",
        sidebar_subscription: "Dose mensile",
        sidebar_logout: "Disconnettersi",
        dashboard_title: "Cruscotto utente",
        dashboard_welcome: "Bentornato, {name}.",
        dashboard_profile_title: "Informazioni sul profilo",
        dashboard_profile_subtitle: "I tuoi dati personali.",
        dashboard_profile_name: "Nome:",
        dashboard_profile_email: "Email:",
        dashboard_loyalty_title: "Punti fedeltà",
        dashboard_loyalty_subtitle: "Guadagna punti con ogni acquisto.",
        dashboard_loyalty_points: "Punti accumulati",
        dashboard_loyalty_value: "Il tuo saldo equivale a uno sconto di {price}.",
    },
    products: {
        title: "Il Nostro Catalogo",
        subtitle: "Trova il tuo profumo perfetto. Usa i filtri per scoprire la nostra selezione."
    },
    filters: {
        title: "Filtri",
        clear: "Cancella",
        search: "Cerca",
        search_placeholder: "Cerca prodotti...",
        sort_by: "Ordina per",
        sort_placeholder: "Seleziona ordine",
        sort_options: {
            name_asc: "Nome (A-Z)",
            name_desc: "Nome (Z-A)",
            price_asc: "Prezzo (Crescente)",
            price_desc: "Prezzo (Decrescente)"
        },
        categories: "Categorie",
        category_options: {
            novedad: "Novità",
            oferta: "Offerte",
            "mas-vendido": "Più venduti",
            pack: "Pack",
            accesorio: "Accessori"
        },
        brands: "Marche",
        size: "Dimensione",
        composition: "Composizione"
    },
    product_card: {
        sold_out: "Esaurito",
        offer: "OFFERTA",
        notify_me: "Avvisami",
        add_to_cart: "Aggiungi"
    },
    product_info: {
        secure_payment: "Acquisto sicuro e pagamento discreto garantito.",
        fast_shipping: "Spedizione rapida in 24/48h in tutta la penisola.",
        discreet_packaging: "Imballaggio 100% discreto senza marchi esterni."
    },
    product_details: {
        description_tab: "Descrizione",
        details_tab: "Dettagli del prodotto"
    },
    related_products: {
        title: "Prodotti Correlati"
    },
    stock_notification: {
        dialog_title: "Notifica di Disponibilità",
        dialog_description: "Riceverai una sola email quando {product_name} tornerà disponibile.",
        error_title: "Errore",
        error_missing_info: "Mancano informazioni sul prodotto o l'email. Riprova.",
        error_generic: "Impossibile elaborare la tua richiesta.",
        error_unexpected: "Si è verificato un errore imprevisto.",
        success_title: "Ti avviseremo!",
        success_description: "Riceverai un'email a {email} non appena {product_name} sarà di nuovo disponibile.",
        cancel_button: "Annulla",
        submit_button: "Richiedi notifica",
        sending_button: "Invio in corso..."
    }
  },
  pt: {
     header: {
      free_shipping: 'GRÁTIS +40€',
      fast_delivery: '24/48h',
      nav_menu: 'Menu de Navegação',
      products: 'Produtos',
      create_pack: 'Crie seu Pacote',
      monthly_dose: 'Dose Mensal'
    },
    cart: {
        title: "Carrinho de Compras",
        empty_title: "O seu carrinho está vazio",
        empty_subtitle: "Parece que ainda não adicionou nada.",
        subtotal: "Subtotal",
        volume_discount: "Desconto por volume (com pré-pagamento)",
        shipping_estimate: "Envio (estimado)",
        total_estimate: "Total Estimado:",
        free_shipping_banner: "Você tem frete GRÁTIS!",
        free_shipping_threshold: "Frete grátis em pedidos acima de {price}",
        checkout_button: "Finalizar Reserva",
        discreet_packaging: "Embalagem 100% discreta.",
        notes: "O desconto por volume e os custos finais de envio serão aplicados na tela de checkout com base no método escolhido.",
        item_added: "Adicionado ao carrinho",
        item_removed: "Produto removido",
        item_unavailable: "Esgotado",
        stock_limit_reached: "Limite de estoque atingido",
    },
     account: {
        layout_title: "Minha conta",
        layout_description: "Gerencie suas informações pessoais, pedidos e endereços.",
        sidebar_admin_panel: "Painel de administração",
        sidebar_dashboard: "Painel do usuário",
        sidebar_orders: "Pedidos",
        sidebar_addresses: "Endereços",
        sidebar_subscription: "Dose mensal",
        sidebar_logout: "Sair",
        dashboard_title: "Painel do usuário",
        dashboard_welcome: "Bem-vindo de volta, {name}.",
        dashboard_profile_title: "Informações do perfil",
        dashboard_profile_subtitle: "Os seus dados pessoais.",
        dashboard_profile_name: "Nome:",
        dashboard_profile_email: "Email:",
        dashboard_loyalty_title: "Pontos de fidelidade",
        dashboard_loyalty_subtitle: "Ganhe pontos a cada compra.",
        dashboard_loyalty_points: "Pontos acumulados",
        dashboard_loyalty_value: "O seu saldo equivale a um desconto de {price}.",
    },
    products: {
        title: "Nosso Catálogo",
        subtitle: "Encontre o seu aroma perfeito. Use os filtros para descobrir a nossa seleção."
    },
    filters: {
        title: "Filtros",
        clear: "Limpar",
        search: "Procurar",
        search_placeholder: "Procurar produtos...",
        sort_by: "Ordenar por",
        sort_placeholder: "Selecionar ordem",
        sort_options: {
            name_asc: "Nome (A-Z)",
            name_desc: "Nome (Z-A)",
            price_asc: "Preço (Crescente)",
            price_desc: "Preço (Decrescente)"
        },
        categories: "Categorias",
        category_options: {
            novedad: "Novidades",
            oferta: "Ofertas",
            "mas-vendido": "Mais vendidos",
            pack: "Packs",
            accesorio: "Acessórios"
        },
        brands: "Marcas",
        size: "Tamanho",
        composition: "Composição"
    },
    product_card: {
        sold_out: "Esgotado",
        offer: "OFERTA",
        notify_me: "Notifique-me",
        add_to_cart: "Adicionar"
    },
    product_info: {
        secure_payment: "Compra segura e pagamento discreto garantido.",
        fast_shipping: "Envio rápido em 24/48h para toda a península.",
        discreet_packaging: "Embalagem 100% discreta sem marcas externas."
    },
    product_details: {
        description_tab: "Descrição",
        details_tab: "Detalhes do produto"
    },
    related_products: {
        title: "Produtos Relacionados"
    },
    stock_notification: {
        dialog_title: "Notificação de Estoque",
        dialog_description: "Você receberá um único e-mail quando {product_name} estiver novamente em estoque.",
        error_title: "Erro",
        error_missing_info: "Faltam informações do produto ou e-mail. Por favor, tente novamente.",
        error_generic: "Não foi possível processar sua solicitação.",
        error_unexpected: "Ocorreu um erro inesperado.",
        success_title: "Nós o notificaremos!",
        success_description: "Você receberá um e-mail em {email} assim que {product_name} estiver disponível novamente.",
        cancel_button: "Cancelar",
        submit_button: "Solicitar Notificação",
        sending_button: "Enviando..."
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');

  const setLanguageCallback = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);
  
  const t = useCallback((key: string, replacements: Record<string, string | number> = {}): string => {
    const keys = key.split('.');
    let result: string | Translations | undefined = translations[language];

    for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
            result = result[k];
        } else {
            return key;
        }
    }

    let strResult = typeof result === 'string' ? result : key;

    // Handle replacements
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

// Alias for useLanguage for convenience in components
export const useTranslation = useLanguage;
