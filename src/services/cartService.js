import { db, auth } from '../firebase';
        import { doc, runTransaction, increment } from 'firebase/firestore';

        export const addToCart = async (product) => {
          const user = auth.currentUser;
          if (!user) throw new Error("User not logged in.");
          const cartItemRef = doc(db, "users", user.uid, "cart", product.id);
          await runTransaction(db, async (transaction) => {
            const doc = await transaction.get(cartItemRef);
            if (doc.exists()) {
              transaction.update(cartItemRef, { quantity: increment(1) });
            } else {
              transaction.set(cartItemRef, {
                name: product.name,
                price: product.price,
                image: product.imageURL || null,
                quantity: 1,
                isProxy: product.isProxy || false, // Critical for Module 2
                ownerId: product.ownerId
              });
            }
          });
        };