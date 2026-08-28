const STORAGE_KEY = 'ner_landslide_offline_reports';

export const getOfflineQueue = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading offline queue', e);
    return [];
  }
};

export const getOfflineCount = () => {
  return getOfflineQueue().length;
};

export const addToOfflineQueue = (reportItem) => {
  const queue = getOfflineQueue();
  const item = {
    ...reportItem,
    _queued_at: new Date().toISOString(),
    _local_id: 'local_' + Math.random().toString(36).substring(2, 9)
  };
  queue.push(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  return queue;
};

export const clearOfflineQueue = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const removeOfflineItem = (localId) => {
  const queue = getOfflineQueue().filter(item => item._local_id !== localId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  return queue;
};
