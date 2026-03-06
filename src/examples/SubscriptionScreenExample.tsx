// /**
//  * Example: Integration of IDFA Attribution in Purchase Flow
//  * 
//  * This example shows how the attribution system works automatically
//  * in a typical subscription purchase screen.
//  */

// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
// import { revenueCatService, PurchasesPackage } from '../services/RevenueCatService';
// import { isTrackingAuthorized, requestTrackingPermissions } from '../services/TrackingService';

// /**
//  * Example Subscription Screen Component
//  */
// const SubscriptionScreen = () => {
//   const [packages, setPackages] = useState<PurchasesPackage[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [attStatus, setAttStatus] = useState<string>('unknown');

//   useEffect(() => {
//     // Load subscription offerings
//     loadOfferings();
    
//     // Check ATT status
//     checkATTStatus();
//   }, []);

//   /**
//    * Load available subscription packages
//    */
//   const loadOfferings = async () => {
//     try {
//       setLoading(true);
//       const offerings = await revenueCatService.getOfferings();
      
//       if (offerings?.current?.availablePackages) {
//         setPackages(offerings.current.availablePackages);
//       }
//     } catch (error) {
//       console.error('Failed to load offerings:', error);
//       Alert.alert('Error', 'Failed to load subscription options');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * Check ATT authorization status
//    */
//   const checkATTStatus = async () => {
//     const isAuthorized = await isTrackingAuthorized();
//     setAttStatus(isAuthorized ? 'authorized' : 'not-authorized');
//   };

//   /**
//    * Handle subscription purchase
//    * 
//    * The attribution system works automatically:
//    * 1. If ATT is authorized, IDFA is already collected
//    * 2. Purchase is processed
//    * 3. Attribution is automatically refreshed after purchase
//    * 4. IDFA + attribution data is sent to RevenueCat
//    */
//   const handlePurchase = async (pkg: PurchasesPackage) => {
//     try {
//       setLoading(true);

//       // Optional: Request ATT permission before purchase if not already done
//       if (attStatus !== 'authorized') {
//         console.log('ATT not authorized, requesting permission...');
//         await requestTrackingPermissions();
//         await checkATTStatus();
//       }

//       // Make the purchase
//       // This automatically refreshes attribution after success
//       const { customerInfo } = await revenueCatService.purchasePackage(pkg);

//       // Check if premium
//       const isPremium = revenueCatService.isPremium(customerInfo);

//       if (isPremium) {
//         Alert.alert('Success! 🎉', 'You now have premium access!');
        
//         // Optional: Set additional user attributes after purchase
//         // This is useful for segmentation in RevenueCat dashboard
//         await revenueCatService.setUserAttributes({
//           purchaseDate: new Date().toISOString(),
//           productId: pkg.product.identifier,
//         });
//       }

//     } catch (error: any) {
//       if (error.userCancelled) {
//         console.log('Purchase cancelled by user');
//       } else {
//         console.error('Purchase failed:', error);
//         Alert.alert('Purchase Failed', error.message || 'Please try again');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * Show native RevenueCat paywall
//    * This also automatically refreshes attribution
//    */
//   const handleShowPaywall = async () => {
//     try {
//       setLoading(true);

//       // Optional: Request ATT permission before showing paywall
//       if (attStatus !== 'authorized') {
//         await requestTrackingPermissions();
//         await checkATTStatus();
//       }

//       // Show native paywall
//       // Attribution is automatically refreshed after any purchase made through paywall
//       const result = await revenueCatService.presentPaywall();

//       if (result.isPremium) {
//         Alert.alert('Success! 🎉', 'You now have premium access!');
//       }

//     } catch (error) {
//       console.error('Paywall error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1, padding: 20 }}>
//       <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
//         Choose Your Plan
//       </Text>

//       {/* ATT Status Indicator */}
//       <View style={{ 
//         padding: 10, 
//         backgroundColor: attStatus === 'authorized' ? '#d4edda' : '#fff3cd',
//         borderRadius: 8,
//         marginBottom: 20 
//       }}>
//         <Text style={{ fontSize: 12 }}>
//           {attStatus === 'authorized' 
//             ? '✅ Tracking authorized - IDFA will be collected with purchase'
//             : '⚠️ Tracking not authorized - Limited attribution data'
//           }
//         </Text>
//       </View>

//       {/* Subscription Packages */}
//       {packages.map((pkg) => (
//         <TouchableOpacity
//           key={pkg.identifier}
//           style={{
//             padding: 20,
//             backgroundColor: '#007AFF',
//             borderRadius: 12,
//             marginBottom: 15,
//           }}
//           onPress={() => handlePurchase(pkg)}
//         >
//           <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
//             {pkg.product.title}
//           </Text>
//           <Text style={{ color: 'white', fontSize: 16, marginTop: 5 }}>
//             {pkg.product.priceString}
//           </Text>
//           <Text style={{ color: 'white', fontSize: 12, marginTop: 5 }}>
//             {pkg.product.description}
//           </Text>
//         </TouchableOpacity>
//       ))}

//       {/* Alternative: Show Native Paywall */}
//       <TouchableOpacity
//         style={{
//           padding: 15,
//           backgroundColor: '#34C759',
//           borderRadius: 12,
//           marginTop: 10,
//         }}
//         onPress={handleShowPaywall}
//       >
//         <Text style={{ color: 'white', fontSize: 16, textAlign: 'center' }}>
//           Show Native Paywall
//         </Text>
//       </TouchableOpacity>

//       {/* Restore Purchases */}
//       <TouchableOpacity
//         style={{
//           padding: 15,
//           marginTop: 20,
//         }}
//         onPress={async () => {
//           try {
//             setLoading(true);
//             await revenueCatService.restorePurchases();
//             Alert.alert('Success', 'Purchases restored!');
//           } catch (error) {
//             Alert.alert('Error', 'Failed to restore purchases');
//           } finally {
//             setLoading(false);
//           }
//         }}
//       >
//         <Text style={{ color: '#007AFF', fontSize: 14, textAlign: 'center' }}>
//           Restore Purchases
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default SubscriptionScreen;

// /**
//  * ATTRIBUTION FLOW EXPLANATION:
//  * 
//  * 1. ON APP LAUNCH:
//  *    - User Centric handles GDPR/CCPA consent
//  *    - ATT permission is requested (iOS 14.5+)
//  *    - If granted, RevenueCat attribution is set up
//  *    - IDFA, IDFV, AppsFlyer ID, Facebook ID are collected
//  * 
//  * 2. BEFORE PURCHASE:
//  *    - (Optional) Check ATT status
//  *    - (Optional) Request ATT permission if not already granted
//  *    - This ensures IDFA will be captured with the purchase
//  * 
//  * 3. DURING PURCHASE:
//  *    - User selects a subscription package
//  *    - RevenueCat processes the purchase
//  *    - Purchase event is sent to Apple/Google
//  * 
//  * 4. AFTER PURCHASE:
//  *    - Attribution is automatically refreshed
//  *    - IDFA + all attribution IDs are sent to RevenueCat
//  *    - AppsFlyer conversion data is included
//  *    - Facebook Anonymous ID is included
//  *    - Device info is included
//  * 
//  * 5. IN REVENUECAT DASHBOARD:
//  *    - Navigate to Customers → Select customer
//  *    - View "Subscriber Attributes" section
//  *    - See all collected identifiers:
//  *      • $idfa (iOS IDFA)
//  *      • $idfv (iOS IDFV)
//  *      • $gpsAdId (Android AD_ID)
//  *      • $appsflyerId (AppsFlyer UID)
//  *      • $mediaSource (e.g., "google_ads", "organic")
//  *      • $campaign (Campaign name)
//  *      • $adGroup (Ad group name)
//  *      • $ad (Ad ID)
//  *      • deviceModel, osVersion, appVersion, etc.
//  * 
//  * BEST PRACTICES:
//  * 
//  * ✅ Request ATT permission BEFORE showing subscription options
//  * ✅ Use User Centric to handle GDPR/CCPA consent first
//  * ✅ Check ATT status and show appropriate messaging
//  * ✅ Let the automatic attribution system handle IDFA collection
//  * ✅ Don't manually call attribution setup (it's automatic)
//  * ✅ Set additional user attributes after purchase for segmentation
//  * 
//  * TESTING:
//  * 
//  * 1. Run app and grant ATT permission
//  * 2. Make a test purchase
//  * 3. Check logs for:
//  *    ✅ [RevenueCat Attribution] Device identifiers collected
//  *    ✅ [RevenueCat Attribution] AppsFlyer ID set: xxx
//  *    ✅ [RevenueCat Attribution] Attribution setup completed
//  * 4. Check RevenueCat Dashboard → Customers → Subscriber Attributes
//  * 5. Verify IDFA and other IDs are present
//  * 
//  * PRIVACY:
//  * 
//  * - IDFA is only collected if user grants ATT permission
//  * - Other IDs (IDFV, AppsFlyer, Facebook) still work without IDFA
//  * - Respects GDPR/CCPA consent via User Centric
//  * - Attribution only runs after proper consent
//  */
