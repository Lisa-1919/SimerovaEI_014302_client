import React, { useState } from 'react'
import styles from './index.module.scss';
import { DarkModeSwitch } from 'react-toggle-dark-mode';

const Toggle = ({ value, onChange }) => (

  <DarkModeSwitch style={{ marginBottom: '2rem' }}
    checked={value}
    onClick={onChange}
    size={40}
  />

)

export default Toggle;