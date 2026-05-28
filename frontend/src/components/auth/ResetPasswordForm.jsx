import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../common/Input';
import Button from '../common/Button';
import { validatePassword, validateConfirmPassword } from '../../utils/validators';

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    newErrors.password = validatePassword(formData.password);
    newErrors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrors({ password: 'Invalid reset token' });
      return;
    }

    if (!validate()) return;

    setLoading(true);
    const result = await resetPassword(token, formData.password);
    setLoading(false);

    if (result.success) {
      navigate('/login');
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-600">Invalid or missing reset token</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-sm text-gray-600 mb-4">Enter your new password</p>
      </div>

      <Input
        label="New Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter new password"
        error={errors.password}
        required
      />

      <Input
        label="Confirm New Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm new password"
        error={errors.confirmPassword}
        required
      />

      <Button type="submit" className="w-full" loading={loading}>
        Reset Password
      </Button>
    </form>
  );
};

export default ResetPasswordForm;

