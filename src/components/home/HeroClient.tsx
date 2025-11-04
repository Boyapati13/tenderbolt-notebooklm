'use client';

import { motion } from 'framer-motion';
import styles from '@/styles/pages/home.module.css';

export default function HeroClient() {
  return (
    <section className={styles.hero}>
      <div className={styles['hero__content']}>
        <motion.h1
          className={styles['hero__title']}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Enterprise AI Platform
        </motion.h1>
        <motion.p
          className={styles['hero__description']}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Transform your business with advanced AI tools and workspace solutions
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button className="button-premium button-premium--primary">Get Started</button>
        </motion.div>
      </div>
    </section>
  );
}
