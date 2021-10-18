import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
     const storagedCart = localStorage.getItem('@RocketShoes:cart');

     if (storagedCart) {
       return JSON.parse(storagedCart);
     }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const {data} = await api.get(`/products/${productId}`);
      const stock = await api.get(`/stock/${productId}`);

      let newCart = cart;

      const productIndex = cart.findIndex( product => product.id === productId);

      if (productIndex !== -1) {
        newCart[productIndex].amount+= 1;

        if(newCart[productIndex].amount > stock.data.amount){
          toast.error('Quantidade solicitada fora de estoque');
  
          newCart[productIndex].amount-= 1;
  
          return
  
        }

        localStorage.setItem('@RocketShoes:cart',JSON.stringify([...newCart])); 
          
        setCart([...newCart]);

      } else {

        setCart([
          ...cart,
          {
            ...data,
            amount : 1
          }
        ])

        localStorage.setItem('@RocketShoes:cart',JSON.stringify([...cart,{...data, amount : 1}]));
  
      }

    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const newCart = cart.filter(product => product.id !== productId);

      if (newCart.length === cart.length){
        toast.error('Erro na remoção do produto');

        return
      }

      setCart(newCart);
  
      localStorage.setItem('@RocketShoes:cart',JSON.stringify(newCart));

    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount < 1) {
        return
      };

      const stock = await api.get(`/stock/${productId}`);

      if (amount > stock.data.amount) {
        toast.error('Quantidade solicitada fora de estoque');
                        
        return
      }
 
      let newCart = cart;

      const productIndex = cart.findIndex( product => product.id === productId);

      if (productIndex !== -1) {

        newCart[productIndex].amount = amount;

        setCart([...newCart]);
        
        localStorage.setItem('@RocketShoes:cart',JSON.stringify([...newCart])); 
                    
        
      } else {

        toast.error('Erro na alteração de quantidade do produto');

        return
      }

    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
