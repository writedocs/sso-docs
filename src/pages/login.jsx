import React, { useState, useRef } from 'react';
import Layout from '@theme/Layout';
import supabase from '../utils/supabase/client';
import { z } from 'zod';
import useBaseUrl from "@docusaurus/useBaseUrl";
import configurations from '../utils/configurations';
import clsx from 'clsx';

export default function Login() {
  const [ssoLoading, setSsoLoading] = useState(false);
  const domainRef = useRef('');
  const [ssoError, setSsoError] = useState(null);
  // Zod schema for email validation
  const emailSchema = z.string().email();

  const redirectURL = window.location.href.split('/').slice(0, 3).join('/') + '/';

  const parseDomain = (domain) => {
    const raw = domain.trim();
    const parsed = emailSchema.safeParse(raw);
    return parsed.success ? raw.split('@')[1].toLowerCase() : raw.toLowerCase();
  }

  const handleSSOLogin = async (e) => {
    e.preventDefault();
    setSsoLoading(true);
    setSsoError(null);

    try {
      const domain = parseDomain(domainRef.current.value);
      const { data, error } = await supabase.auth.signInWithSSO({
        domain,
        options: {
          redirectTo: redirectURL,
        },
      });

      if (error) {
        throw error;
      }

      // If successful, data will contain a URL to redirect to
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('SSO login error:', error);
      setSsoError(error.message);
    } finally {
      setSsoLoading(false);
    }
  };

  return (
    <Layout title="Login">
      <div className="page-wrapper" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh',
        padding: '2rem'
      }}>
        <div className="content-container" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '400px'
        }}>
          <div className="card" style={{
            width: '100%',
            backgroundColor: 'var(--card-background-color)',
            boxShadow: 'var(--box-shadow2)',
            borderRadius: 'var(--border-radius-medium)',
            padding: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <img
                src={useBaseUrl(configurations.images.favicon)}
                alt="WriteDocs Logo"
                style={{ marginRight: '1rem', height: '32px' }}
              />
              <h2 style={{
                margin: 0,
                color: 'var(--font-main-color)',
                fontFamily: 'var(--font-main)',
                fontWeight: 'var(--font-weight-heavy)'
              }}>
                Login
              </h2>
            </div>

            <form onSubmit={handleSSOLogin}>
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="Email or SSO Domain (ex: mycompany.com)"
                  ref={domainRef}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--border-radius-small)',
                    border: '1px solid var(--main-border-color)',
                    backgroundColor: 'var(--ifm-background-color)',
                    color: 'var(--font-main-color)',
                    transition: 'border-color 0.2s ease-in-out'
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={ssoLoading}
                className={clsx(
                  'button',
                  'button--primary',
                  'button--block',
                  ssoLoading && 'disabled'
                )}
                style={{
                  padding: '0.75rem 1rem',
                  fontWeight: 'var(--font-weight-medium)',
                  transition: 'background-color 0.2s ease-in-out'
                }}
              >
                {ssoLoading ? 'Loading...' : 'Continue with SSO'}
              </button>
            </form>
          </div>

          {ssoError && (
            <div className="error-message-container" style={{
              width: '100%',
              marginTop: '1rem'
            }}>
              <div className="error-message" style={{
                color: 'var(--callout-danger-title-color)',
                textAlign: 'center',
                padding: '0.5rem',
                backgroundColor: 'var(--callout-danger-bkg-color)',
                borderRadius: 'var(--border-radius-small)',
                fontSize: 'var(--font-size-medium)'
              }}>
                {ssoError}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 